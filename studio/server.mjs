import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {spawn, spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {requireBinary} from "../scripts/lib/binaries.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PUBLIC_DIR = path.join(HERE, "public");
const CACHE_DIR = path.join(ROOT, "local", ".cache");
const THUMB_DIR = path.join(CACHE_DIR, "thumbs");
const INDEX_FILE = path.join(CACHE_DIR, "assets-index.json");
const META_FILE = path.join(CACHE_DIR, "asset-meta.json");
const ARCHIVE_DIR = path.join(ROOT, "local", "archive");
const PORT = Number(process.env.ASSET_PORT ?? 4321);
const HOST = process.env.ASSET_HOST ?? "127.0.0.1";

const FFMPEG = requireBinary("ffmpeg", "FFMPEG_PATH");
const FFPROBE = requireBinary("ffprobe", "FFPROBE_PATH");

const VIDEO = new Set([".mp4", ".mov", ".webm", ".m4v"]);
const AUDIO = new Set([".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac"]);
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
const FONT = new Set([".woff2", ".woff", ".ttf", ".otf"]);

const GROUPS = [
  {id: "renders", label: "成片与渲染", dir: "local/out", recursive: false},
  {id: "qc", label: "质检帧", dir: "local/out/qc", recursive: true},
  {id: "voice", label: "旁白与 BGM", dir: "public/audio", recursive: true},
  {id: "sfx", label: "音效", dir: "public/sfx", recursive: true},
  {id: "docs", label: "文档素材", dir: "docs/assets", recursive: false},
  {id: "fonts", label: "字体", dir: "public/fonts", recursive: false},
];

const WRITABLE = ["local/"];
const ALLOWED = GROUPS.map((group) => group.dir).concat(["local/archive", "public/fonts"]);

class InvalidPathError extends Error {}

const normalize = (value) => value.replace(/\\/g, "/");
const typeOf = (ext) => {
  if (VIDEO.has(ext)) return "video";
  if (AUDIO.has(ext)) return "audio";
  if (IMAGE.has(ext)) return "image";
  if (FONT.has(ext)) return "font";
  return "other";
};

const safeResolve = (relativePath) => {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new InvalidPathError("empty path");
  }
  const cleaned = normalize(relativePath).replace(/^\/+/, "");
  if (cleaned.includes("\0") || cleaned.split("/").includes("..")) {
    throw new InvalidPathError("invalid path");
  }
  const absolute = path.resolve(ROOT, cleaned);
  const inside = ALLOWED.some((dir) => {
    const base = path.resolve(ROOT, dir);
    return absolute === base || absolute.startsWith(base + path.sep);
  });
  if (!inside) {
    throw new InvalidPathError("path outside the asset library");
  }
  return absolute;
};

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  const temp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, filePath);
};

const indexCache = readJson(INDEX_FILE, {});
const userMeta = readJson(META_FILE, {});
const dirtyIndex = {value: false};

const probe = (absolutePath, stat) => {
  const key = normalize(path.relative(ROOT, absolutePath));
  const cached = indexCache[key];
  if (cached && cached.mtime === stat.mtimeMs && cached.size === stat.size) {
    return cached;
  }
  const result = spawnSync(
    FFPROBE,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-show_entries",
      "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
      "-of",
      "json",
      absolutePath,
    ],
    {encoding: "utf8", maxBuffer: 4 * 1024 * 1024},
  );
  let data = {mtime: stat.mtimeMs, size: stat.size};
  if (result.status === 0) {
    try {
      const parsed = JSON.parse(result.stdout);
      const streams = parsed.streams ?? [];
      const video = streams.find((stream) => stream.codec_type === "video");
      const audio = streams.find((stream) => stream.codec_type === "audio");
      if (video) {
        data.width = video.width;
        data.height = video.height;
        const [num, den] = String(video.r_frame_rate ?? "0/1").split("/").map(Number);
        data.fps = den ? Math.round((num / den) * 100) / 100 : undefined;
        data.videoCodec = video.codec_name;
      }
      if (audio) {
        data.sampleRate = Number(audio.sample_rate);
        data.channels = audio.channels;
        data.audioCodec = audio.codec_name;
      }
      const duration = Number(parsed.format?.duration);
      if (Number.isFinite(duration)) data.duration = Math.round(duration * 1000) / 1000;
    } catch {
      // keep file stats only
    }
  }
  indexCache[key] = data;
  dirtyIndex.value = true;
  return data;
};

const walk = (dir, recursive) => {
  if (!fs.existsSync(dir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith(".")) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) output.push(...walk(absolute, true));
      continue;
    }
    output.push(absolute);
  }
  return output;
};

const scan = () => {
  const assets = [];
  for (const group of GROUPS) {
    const base = path.resolve(ROOT, group.dir);
    for (const absolutePath of walk(base, group.recursive)) {
      const stat = fs.statSync(absolutePath);
      const ext = path.extname(absolutePath).toLowerCase();
      const type = typeOf(ext);
      if (type === "other") continue;
      const relative = normalize(path.relative(ROOT, absolutePath));
      const meta = probe(absolutePath, stat);
      const palette = /\.(png|jpg|jpeg|webp|gif|avif)$/i.test(ext)
        ? "image"
        : type;
      assets.push({
        id: relative,
        path: relative,
        name: path.basename(absolutePath),
        group: group.id,
        groupLabel: group.label,
        type,
        kind: palette,
        ext: ext.replace(".", ""),
        size: stat.size,
        mtime: stat.mtimeMs,
        width: meta.width ?? null,
        height: meta.height ?? null,
        duration:
          type === "video" || type === "audio" || ext === ".gif"
            ? meta.duration ?? null
            : null,
        fps:
          type === "video" || ext === ".gif" ? meta.fps ?? null : null,
        videoCodec: meta.videoCodec ?? null,
        audioCodec: meta.audioCodec ?? null,
        sampleRate: meta.sampleRate ?? null,
        channels: meta.channels ?? null,
        media: `/media?path=${encodeURIComponent(relative)}`,
        thumb:
          type === "video" || ext === ".gif"
            ? `/thumb?path=${encodeURIComponent(relative)}`
            : type === "image"
              ? `/media?path=${encodeURIComponent(relative)}`
              : null,
        remotion: relative.startsWith("public/") ? relative.slice("public/".length) : null,
        user: userMeta[relative] ?? {favorite: false, tags: [], note: ""},
      });
    }
  }
  assets.sort((a, b) => b.mtime - a.mtime);
  return assets;
};

const thumbFor = (relativePath, absolutePath) => {
  const stat = fs.statSync(absolutePath);
  const hash = crypto
    .createHash("sha1")
    .update(`${relativePath}:${stat.mtimeMs}:${stat.size}`)
    .digest("hex")
    .slice(0, 20);
  const target = path.join(THUMB_DIR, `${hash}.jpg`);
  if (fs.existsSync(target)) return target;
  fs.mkdirSync(THUMB_DIR, {recursive: true});
  const seconds = Math.min(1, Math.max(0.1, (indexCache[relativePath]?.duration ?? 2) * 0.12));
  const result = spawnSync(
    FFMPEG,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      String(seconds),
      "-i",
      absolutePath,
      "-frames:v",
      "1",
      "-vf",
      "scale=720:-1:flags=lanczos",
      "-q:v",
      "4",
      target,
    ],
    {encoding: "utf8"},
  );
  return result.status === 0 && fs.existsSync(target) ? target : null;
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

const sendJson = (res, status, value) => {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
};

const streamFile = (req, res, absolutePath) => {
  const stat = fs.statSync(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const range = req.headers.range;
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;
      if (start >= stat.size || end >= stat.size || start > end) {
        res.writeHead(416, {"Content-Range": `bytes */${stat.size}`});
        res.end();
        return;
      }
      res.writeHead(206, {
        "Content-Type": mime[ext] ?? "application/octet-stream",
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(absolutePath, {start, end}).pipe(res);
      return;
    }
  }
  res.writeHead(200, {
    "Content-Type": mime[ext] ?? "application/octet-stream",
    "Content-Length": stat.size,
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache",
  });
  fs.createReadStream(absolutePath).pipe(res);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });

const reveal = (absolutePath) => {
  if (process.platform === "win32") {
    spawn("explorer.exe", [`/select,${absolutePath}`], {detached: true, stdio: "ignore"}).unref();
  } else if (process.platform === "darwin") {
    spawn("open", ["-R", absolutePath], {detached: true, stdio: "ignore"}).unref();
  } else {
    spawn("xdg-open", [path.dirname(absolutePath)], {detached: true, stdio: "ignore"}).unref();
  }
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

    if (url.pathname === "/api/bootstrap") {
      const assets = scan();
      const catalog = readJson(path.join(ROOT, "src", "library", "catalog.json"), null);
      const totals = GROUPS.map((group) => {
        const items = assets.filter((asset) => asset.group === group.id);
        return {
          ...group,
          count: items.length,
          bytes: items.reduce((sum, asset) => sum + asset.size, 0),
        };
      });
      sendJson(res, 200, {
        assets,
        groups: totals,
        catalog,
        root: ROOT,
        generatedAt: new Date().toISOString(),
      });
      return;
    }

    if (url.pathname === "/api/meta" && req.method === "POST") {
      const body = await readBody(req);
      const relative = normalize(body.path ?? "");
      safeResolve(relative);
      userMeta[relative] = {
        favorite: Boolean(body.favorite),
        tags: Array.isArray(body.tags)
          ? body.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12)
          : [],
        note: String(body.note ?? "").slice(0, 500),
      };
      writeJson(META_FILE, userMeta);
      sendJson(res, 200, {ok: true, meta: userMeta[relative]});
      return;
    }

    if (url.pathname === "/api/archive" && req.method === "POST") {
      const body = await readBody(req);
      const absolute = safeResolve(body.path);
      const relative = normalize(path.relative(ROOT, absolute));
      const writable = WRITABLE.some((prefix) => relative.startsWith(prefix));
      if (!writable || !fs.existsSync(absolute)) {
        sendJson(res, 400, {error: "只有 local/ 下的文件可以归档"});
        return;
      }
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const target = path.join(ARCHIVE_DIR, stamp, relative.replace(/^local\//, ""));
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.renameSync(absolute, target);
      sendJson(res, 200, {ok: true, archivedTo: normalize(path.relative(ROOT, target))});
      return;
    }

    if (url.pathname === "/api/reveal" && req.method === "POST") {
      const body = await readBody(req);
      reveal(safeResolve(body.path));
      sendJson(res, 200, {ok: true});
      return;
    }

    if (url.pathname === "/media" || url.pathname === "/thumb") {
      const absolute = safeResolve(url.searchParams.get("path"));
      if (!fs.existsSync(absolute)) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      if (url.pathname === "/thumb") {
        const relative = normalize(path.relative(ROOT, absolute));
        const thumb = thumbFor(relative, absolute);
        if (!thumb) {
          res.writeHead(404);
          res.end("thumbnail failed");
          return;
        }
        streamFile(req, res, thumb);
        return;
      }
      streamFile(req, res, absolute);
      return;
    }

    const relativeStatic = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const staticPath = path.resolve(PUBLIC_DIR, relativeStatic);
    if (!staticPath.startsWith(PUBLIC_DIR + path.sep)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    if (!fs.existsSync(staticPath) || fs.statSync(staticPath).isDirectory()) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    streamFile(req, res, staticPath);
  } catch (error) {
    const status = error instanceof InvalidPathError ? 400 : 500;
    sendJson(res, status, {error: error instanceof Error ? error.message : "unknown error"});
  }
});

const shutdown = () => {
  if (dirtyIndex.value) writeJson(INDEX_FILE, indexCache);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", () => {
  if (dirtyIndex.value) {
    try {
      writeJson(INDEX_FILE, indexCache);
    } catch {
      // ignore shutdown write errors
    }
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`端口 ${PORT} 已被占用。用 ASSET_PORT=4322 npm run assets 换一个端口。`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, HOST, () => {
  const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`\n  VIDEO ASSET LIBRARY\n  http://${displayHost}:${PORT}\n`);
});
