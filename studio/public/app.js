const state = {
  data: null,
  tab: "library",
  type: "all",
  group: "all",
  query: "",
  sort: "recent",
  family: "all",
  favoritesOnly: false,
  selected: null,
  loading: true,
  lastTrigger: null,
};

const TAB_LABELS = {
  library: "素材库",
  styles: "设计资产",
  sources: "来源与许可",
};

const initialTab = new URLSearchParams(location.search).get("tab");
if (Object.hasOwn(TAB_LABELS, initialTab)) state.tab = initialTab;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char];
  });

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9Z"/>',
  folder: '<path d="M3 6.5h6l2 2h10v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  archive: '<path d="M4 7h16v13H4z"/><path d="M3 4h18v3H3z"/><path d="M9 11h6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  play: '<path d="m9 6 9 6-9 6Z"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  audio: '<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  type: '<path d="M4 6h16M12 6v12M8 18h8"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
  folder2: '<path d="M3 7h7l2 2h9v10H3z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4"/>',
  database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  slash: '<path d="m7 19 10-14"/>',
};

const icon = (name, className = "icon") =>
  `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] ?? ICONS.file}</svg>`;

const fmtBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const fmtBytesCompact = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024 * 1024) return fmtBytes(bytes);
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const fmtDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes === 0) return `${rest}s`;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

const fmtDate = (timestamp) =>
  new Date(timestamp).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtScanTime = (timestamp) => {
  if (!timestamp) return "正在读取索引";
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay ? `扫描于 ${time}` : `扫描于 ${fmtDate(timestamp)}`;
};

const TYPE_LABEL = {
  video: "VIDEO",
  audio: "AUDIO",
  image: "IMAGE",
  font: "FONT",
};

const TYPE_ICON = {
  video: "film",
  audio: "audio",
  image: "image",
  font: "type",
};

const GROUP_ICON = {
  renders: "film",
  qc: "check",
  voice: "audio",
  sfx: "audio",
  docs: "file",
  fonts: "type",
};

const githubFor = (source) => {
  if (!source) return null;
  if (source.startsWith("huashu-art-motion/")) {
    return `https://github.com/alchaincyf/huashu-art-motion/blob/main/${source.slice("huashu-art-motion/".length)}`;
  }
  return null;
};

let toastTimer = null;
const toast = (message) => {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 1900);
};

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast("已复制");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("已复制");
  }
};

const post = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "request failed");
  }
  return response.json();
};

const setText = (selector, value) => {
  const node = $(selector);
  if (node) node.textContent = value;
};

const setTabCounts = () => {
  const data = state.data;
  if (!data) return;
  const catalog = data.catalog;
  const styleCount = catalog ? (catalog.styles?.length ?? 0) + (catalog.packs?.length ?? 0) : 0;
  const sourceCount = catalog?.sources?.length ?? 0;
  const values = {
    library: data.assets.length,
    styles: styleCount,
    sources: sourceCount,
  };
  Object.entries(values).forEach(([tab, value]) => {
    setText(`#tab-count-${tab}`, String(value));
    setText(`#mobile-count-${tab}`, String(value));
  });
};

const setStats = () => {
  const data = state.data;
  if (!data) return;
  const totalBytes = data.assets.reduce((sum, asset) => sum + asset.size, 0);
  const favorites = data.assets.filter((asset) => asset.user?.favorite).length;
  setText("#stat-assets", data.assets.length.toLocaleString("zh-CN"));
  setText("#stat-size", fmtBytesCompact(totalBytes));
  setText("#stat-favorites", favorites.toLocaleString("zh-CN"));
  setText("#stat-groups", String(data.groups.length));
  setText("#scan-stamp", fmtScanTime(data.generatedAt));
};

const load = async (silent = false) => {
  if (!silent) state.loading = true;
  try {
    const response = await fetch("/api/bootstrap", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    state.loading = false;
    setStats();
    setTabCounts();
    render();
    const openPath = new URLSearchParams(location.search).get("open");
    if (openPath && !state.selected) openDrawer(openPath);
    if (silent) toast("已重新扫描");
  } catch (error) {
    state.loading = false;
    const skeleton = $("#skeleton");
    if (skeleton) skeleton.hidden = true;
    $("#view-root").innerHTML = `
      <div class="empty">
        <strong>索引读取失败</strong>
        <p>${esc(error.message)}</p>
        <button class="btn btn--secondary" type="button" data-retry>重新读取</button>
      </div>`;
  }
};

const filteredAssets = () => {
  if (!state.data) return [];
  const query = state.query.trim().toLowerCase();
  let items = state.data.assets;
  if (state.type !== "all") items = items.filter((asset) => asset.type === state.type);
  if (state.group !== "all") items = items.filter((asset) => asset.group === state.group);
  if (state.favoritesOnly) items = items.filter((asset) => asset.user?.favorite);
  if (query) {
    items = items.filter((asset) =>
      `${asset.name} ${asset.path} ${(asset.user?.tags ?? []).join(" ")} ${asset.groupLabel}`
        .toLowerCase()
        .includes(query),
    );
  }
  const sorters = {
    recent: (a, b) => b.mtime - a.mtime,
    size: (a, b) => b.size - a.size,
    name: (a, b) => a.name.localeCompare(b.name, "zh-CN"),
    duration: (a, b) => (b.duration ?? 0) - (a.duration ?? 0),
  };
  return items.slice().sort(sorters[state.sort] ?? sorters.recent);
};

const renderSidebar = () => {
  const data = state.data;
  if (!data) return;
  const totalBytes = data.assets.reduce((sum, asset) => sum + asset.size, 0);
  const favorites = data.assets.filter((asset) => asset.user?.favorite).length;
  const shades = ["#3355ff", "#6f86ff", "#93a4ff", "#b4c1ff", "#ccd4ff", "#dfe3ee"];
  const storageBar = data.groups
    .map(
      (group, index) =>
        `<i style="width:${totalBytes ? (group.bytes / totalBytes) * 100 : 0}%;background:${
          shades[index % shades.length]
        }" title="${esc(group.label)} · ${fmtBytes(group.bytes)}"></i>`,
    )
    .join("");
  const groupRows = data.groups
    .map(
      (group) => `
      <button class="filter ${state.group === group.id ? "is-active" : ""}" type="button" data-group="${group.id}">
        <span>${icon(GROUP_ICON[group.id] ?? "folder", "icon")}${esc(group.label)}</span>
        <small>${group.count}</small>
      </button>`,
    )
    .join("");

  $("#sidebar").innerHTML = `
    <button class="btn btn--secondary sidebar__close" type="button" data-close-filters>关闭筛选</button>
    <div class="side-block">
      <div class="side-block__head"><span class="t-label">LIBRARY SIZE</span><span>${data.assets.length}</span></div>
      <p class="side-strong">${fmtBytes(totalBytes)}</p>
      <p class="side-sub">${data.assets.length} 个文件，分布在 ${data.groups.length} 个目录。</p>
      <div class="storage-bar" aria-label="按目录统计的占用">${storageBar}</div>
    </div>
    <div class="side-block">
      <div class="side-block__head"><span class="t-label">素材目录</span><span>${data.groups.length}</span></div>
      <button class="filter ${state.group === "all" ? "is-active" : ""}" type="button" data-group="all">
        <span>${icon("database", "icon")}全部素材</span><small>${data.assets.length}</small>
      </button>
      ${groupRows}
    </div>
    <div class="side-block">
      <div class="side-block__head"><span class="t-label">快速筛选</span><span>QUICK</span></div>
      <button class="filter ${state.favoritesOnly ? "is-active" : ""}" type="button" data-favorites="1">
        <span>${icon("star", "icon")}收藏</span><small>${favorites}</small>
      </button>
      <button class="filter" type="button" data-rescan="1">
        <span>${icon("refresh", "icon")}重新扫描</span><small>FS</small>
      </button>
    </div>
    <div class="side-block">
      <div class="side-block__head"><span class="t-label">OUTPUT</span><span>LOCAL</span></div>
      <p class="side-note">渲染输出统一写入 <b>local/out</b>。归档会移动到 <b>local/archive</b>，不会删除原文件。</p>
    </div>`;
};

const thumbHtml = (asset) => {
  if (asset.type === "audio") {
    const bars = Array.from({ length: 32 }, (_, index) => {
      const seed = (asset.name.charCodeAt(index % asset.name.length) * 17 + index * 31) % 72;
      return `<i style="height:${18 + seed}%"></i>`;
    }).join("");
    return `<div class="wave">${bars}</div>`;
  }
  if (asset.type === "font") {
    return `<div class="thumb-fallback thumb-fallback--font">Aa 汉</div>`;
  }
  if (asset.type === "video" && asset.thumb) {
    return `
      <img loading="lazy" src="${asset.thumb}" alt="${esc(asset.name)}" />
      <video class="card-preview" muted loop playsinline preload="none" poster="${asset.thumb}" data-preview="${asset.media}"></video>
      <span class="play-chip" aria-hidden="true">${icon("play")}</span>`;
  }
  if (asset.thumb) {
    return `<img loading="lazy" src="${asset.thumb}" alt="${esc(asset.name)}" />`;
  }
  return `<div class="thumb-fallback">${TYPE_LABEL[asset.type] ?? "FILE"}</div>`;
};

const assetCard = (asset) => `
  <article class="card card--button" data-open="${esc(asset.path)}" tabindex="0" role="button">
    <div class="thumb">
      ${thumbHtml(asset)}
      <span class="type-badge">${TYPE_LABEL[asset.type] ?? "FILE"}</span>
      ${asset.duration ? `<span class="duration-badge">${fmtDuration(asset.duration)}</span>` : ""}
      ${asset.user?.favorite ? `<span class="fav-mark">${icon("star")}</span>` : ""}
    </div>
    <div class="card-body">
      <div class="card-title" title="${esc(asset.name)}">${esc(asset.name)}</div>
      <div class="card-path" title="${esc(asset.path)}">${esc(asset.path)}</div>
      <div class="card-meta">
        <span>${fmtBytes(asset.size)}</span>
        ${asset.width ? `<span>${asset.width}×${asset.height}</span>` : ""}
        ${asset.fps ? `<span>${asset.fps} fps</span>` : ""}
        ${asset.sampleRate ? `<span>${(asset.sampleRate / 1000).toFixed(1)} kHz</span>` : ""}
      </div>
      ${
        asset.user?.tags?.length
          ? `<div class="card-tags">${asset.user.tags
              .slice(0, 4)
              .map((tag) => `<span class="tag">${esc(tag)}</span>`)
              .join("")}</div>`
          : ""
      }
    </div>
  </article>`;

const activeGroupLabel = () => {
  if (!state.data) return "全部素材";
  if (state.group === "all") return "全部素材";
  return state.data.groups.find((group) => group.id === state.group)?.label ?? "全部素材";
};

const hasFilters = () =>
  state.type !== "all" || state.group !== "all" || state.favoritesOnly || Boolean(state.query.trim());

const renderLibrary = () => {
  const items = filteredAssets();
  const typeCount = (type) =>
    state.data.assets.filter(
      (asset) =>
        (state.group === "all" || asset.group === state.group) &&
        (type === "all" || asset.type === type),
    ).length;
  const types = ["all", "video", "audio", "image", "font"];

  return `
    <div class="view-head">
      <div>
        <p class="view-kicker">ASSET LIBRARY / ${items.length} VISIBLE</p>
        <h2 class="view-title" id="view-title">素材库</h2>
        <p class="view-note">成片、QC 帧、旁白、音效、封面和字体都在这里浏览。选择文件后可预览、收藏、加标签或复制 Remotion 路径。</p>
      </div>
      <div class="view-head__actions">
        <button class="btn btn--secondary filters-toggle" type="button" data-open-filters>
          ${icon("filter")}筛选
        </button>
      </div>
    </div>
    <div class="toolbar">
      ${types
        .map(
          (type) => `
          <button class="chip ${state.type === type ? "is-active" : ""}" type="button" data-type="${type}">
            ${type === "all" ? "全部" : TYPE_LABEL[type]}
            <small>${typeCount(type)}</small>
          </button>`,
        )
        .join("")}
      <span class="toolbar__spacer"></span>
      <label class="select-wrap">
        <span class="sr-only">排序方式</span>
        <select class="select" id="sort" aria-label="排序方式">
          <option value="recent" ${state.sort === "recent" ? "selected" : ""}>最近修改</option>
          <option value="size" ${state.sort === "size" ? "selected" : ""}>文件大小</option>
          <option value="name" ${state.sort === "name" ? "selected" : ""}>名称</option>
          <option value="duration" ${state.sort === "duration" ? "selected" : ""}>时长</option>
        </select>
        ${icon("chevron")}
      </label>
    </div>
    <div class="result-line">
      <span><strong>${items.length}</strong> 个结果 · ${esc(activeGroupLabel())}${
        state.favoritesOnly ? " · 收藏" : ""
      }${state.query.trim() ? ` · “${esc(state.query.trim())}”` : ""}</span>
      ${
        hasFilters()
          ? '<button class="btn btn--quiet" type="button" data-clear-filters>清除筛选</button>'
          : ""
      }
    </div>
    ${
      items.length
        ? `<div class="grid">${items.map(assetCard).join("")}</div>`
        : `<div class="empty">
            <strong>没有匹配的素材</strong>
            <p>换一个关键词，或清除当前筛选后再试。</p>
            <button class="btn btn--secondary" type="button" data-clear-filters>清除筛选</button>
          </div>`
    }`;
};

const paletteDots = (palette) => {
  if (!palette) return "";
  return `<div class="dots">${["bg", "accent", "accent2", "ink"]
    .map((key) => `<i style="background:${palette.colors[key]}"></i>`)
    .join("")}</div>`;
};

const renderStyles = () => {
  const catalog = state.data.catalog;
  if (!catalog) return '<div class="empty"><strong>catalog 尚未生成</strong><p>运行 library:import 后再查看设计资产。</p></div>';
  const query = state.query.trim().toLowerCase();
  const palettes = catalog.palettes ?? [];
  const packs = catalog.packs ?? [];
  const paletteById = Object.fromEntries(palettes.map((palette) => [palette.id, palette]));

  const styles = (catalog.styles ?? []).filter((style) => {
    if (state.family !== "all" && style.family !== state.family) return false;
    if (!query) return true;
    return `${style.name} ${style.english ?? ""} ${style.technique ?? ""} ${style.visual ?? ""}`
      .toLowerCase()
      .includes(query);
  });

  return `
    <div class="view-head">
      <div>
        <p class="view-kicker">CATALOG / ${catalog.styles?.length ?? 0} STYLES · ${packs.length} PACKS</p>
        <h2 class="view-title" id="view-title">设计资产</h2>
        <p class="view-note">来自 Huashu Art Motion 与本仓库原创风格包的可检索目录。色板、风格、动画语法和预览入口放在同一处。</p>
      </div>
    </div>

    <section class="section" aria-labelledby="packs-heading">
      <div class="section-head"><h3 id="packs-heading">风格包</h3><span>${packs.length} PACKS</span></div>
      <div class="pack-grid">
        ${packs
          .map(
            (pack) => `
          <article class="pack">
            <div class="pack__top">
              <span class="t-label">PACK</span>
              <span class="pack__status">${esc(pack.status.toUpperCase())}</span>
            </div>
            <h4 class="pack__name">${esc(pack.name)}</h4>
            <div class="pack__id">${esc(pack.id)}</div>
            <dl class="meta-rows">
              <div class="meta-row"><dt>预览</dt><dd>${esc(pack.previewComposition)}</dd></div>
              <div class="meta-row"><dt>入口</dt><dd>${esc(pack.entry)}</dd></div>
              <div class="meta-row"><dt>色板</dt><dd>${esc(pack.palette)}</dd></div>
            </dl>
          </article>`,
          )
          .join("")}
      </div>
    </section>

    <section class="section" aria-labelledby="palettes-heading">
      <div class="section-head"><h3 id="palettes-heading">色板</h3><span>${palettes.length} PALETTES</span></div>
      <div class="palette-grid">
        ${palettes
          .map(
            (palette) => `
          <article class="palette">
            <div class="palette__title"><span>${esc(palette.name)}</span><span>${esc(palette.id)}</span></div>
            <div class="swatches">
              ${["bg", "surface", "ink", "sub", "accent", "accent2"]
                .map(
                  (key) =>
                    `<div class="swatch" style="background:${palette.colors[key]}" title="${key} ${palette.colors[key]}"></div>`,
                )
                .join("")}
            </div>
            <p class="palette__note">${esc(palette.bestFor)}</p>
          </article>`,
          )
          .join("")}
      </div>
    </section>

    <section class="section" aria-labelledby="styles-heading">
      <div class="section-head"><h3 id="styles-heading">风格</h3><span>${styles.length} MATCHED</span></div>
      <div class="toolbar">
        ${["all", "original", "huashu"]
          .map(
            (family) => `
            <button class="chip ${state.family === family ? "is-active" : ""}" type="button" data-family="${family}">
              ${family === "all" ? "全部" : family === "original" ? "原创" : "花叔 / 36"}
            </button>`,
          )
          .join("")}
      </div>
      <div class="style-grid">
        ${styles
          .map((style) => {
            const link = githubFor(style.source);
            const palette = style.palette ? paletteById[style.palette] : null;
            const familyLabel = style.family === "original" ? "原创" : "花叔";
            return `
            <article class="style-card">
              <div class="style-card__top">
                <span class="family ${style.family}">${familyLabel}</span>
                <span class="quality">Q${style.quality}/5</span>
              </div>
              <h4 class="style-card__name">${esc(style.name)}</h4>
              <div class="style-card__id">${esc(style.english ?? style.id)}</div>
              <p class="style-line"><b>手法</b> ${esc(style.technique ?? "")}</p>
              <p class="style-line"><b>母题</b> ${esc(style.motion ?? "")}</p>
              <p class="style-line"><b>短板</b> ${esc(style.weakness ?? "")}</p>
              <div class="style-card__foot">
                ${paletteDots(palette)}
                ${link ? `<a class="src-link" href="${link}" target="_blank" rel="noreferrer">SOURCE ${icon("external")}</a>` : ""}
              </div>
            </article>`;
          })
          .join("")}
      </div>
    </section>

    <section class="section" aria-labelledby="grammars-heading">
      <div class="section-head"><h3 id="grammars-heading">动画语法</h3><span>${catalog.grammars?.length ?? 0} GRAMMARS</span></div>
      <div class="grammar-grid">
        ${(catalog.grammars ?? [])
          .map(
            (grammar) => `
          <article class="grammar">
            <div class="grammar__id">${esc(grammar.id.toUpperCase())}</div>
            <div class="grammar__name">${esc(grammar.name)}</div>
            <p class="grammar__line">${esc(grammar.oneLiner)}</p>
          </article>`,
          )
          .join("")}
      </div>
    </section>`;
};

const renderSources = () => {
  const catalog = state.data.catalog;
  if (!catalog) return '<div class="empty"><strong>catalog 尚未生成</strong><p>运行 library:import 后再查看来源与许可。</p></div>';
  return `
    <div class="view-head">
      <div>
        <p class="view-kicker">SOURCES / LICENSES</p>
        <h2 class="view-title" id="view-title">来源与许可</h2>
        <p class="view-note">包含原创风格包，以及 Huashu Art Motion 的设计与方法来源。第三方成片、角色和样片素材不进入本仓库。</p>
      </div>
    </div>
    <div class="source-list">
      ${(catalog.sources ?? [])
        .map(
          (source) => `
        <article class="source">
          <span class="source__license">${esc(source.license)}</span>
          <h3>${esc(source.name)}</h3>
          <p class="source__meta">${esc(source.author)} · ${esc(source.usage)}</p>
          <div>
            <p class="source__note">${esc(source.note)}</p>
            ${
              /^https?:\/\//.test(source.repo)
                ? `<a class="src-link" href="${source.repo}" target="_blank" rel="noreferrer">${esc(source.repo)} ${icon("external")}</a>`
                : `<p class="source__meta">${esc(source.repo)}</p>`
            }
          </div>
        </article>`,
        )
        .join("")}
    </div>
    <section class="section" style="margin-top: 48px" aria-labelledby="scope-heading">
      <div class="section-head"><h3 id="scope-heading">取用边界</h3><span>WHAT WE TOOK</span></div>
      <div class="notice">
        <b>取用：</b>36 张风格卡、9 张语法卡、8 套色板、方法文档与 OFL 字体。<br />
        <b>重写：</b>所有 Remotion 组件都在本工程内重新实现，没有复制对方的渲染器或网页源码。<br />
        <b>未取用：</b>对方的成片、GIF 样片、角色、字体文件与品牌素材。<br />
        Huashu Art Motion 代码与文档为 MIT，字体为 SIL OFL 1.1，完整版权声明见仓库根目录 <b>THIRD_PARTY_NOTICES.md</b>。
      </div>
    </section>`;
};

const renderMain = () => {
  if (state.loading || !state.data) return;
  renderSidebar();
  const skeleton = $("#skeleton");
  if (skeleton) skeleton.hidden = true;
  const root = $("#view-root");
  root.innerHTML =
    state.tab === "library"
      ? renderLibrary()
      : state.tab === "styles"
        ? renderStyles()
        : renderSources();
};

const syncTabUi = () => {
  $$("[data-tab]").forEach((tab) => {
    const active = tab.dataset.tab === state.tab;
    tab.classList.toggle("is-active", active);
    if (tab.getAttribute("role") === "tab") tab.setAttribute("aria-selected", String(active));
  });
  document.title = `${TAB_LABELS[state.tab]} · 视频制作系统`;
};

const render = () => {
  if (state.loading || !state.data) return;
  syncTabUi();
  renderMain();
};

const drawerRows = (asset) =>
  [
    ["路径", asset.path],
    ["目录", asset.groupLabel],
    ["类型", `${asset.type.toUpperCase()} / ${asset.ext.toUpperCase()}`],
    ["大小", fmtBytes(asset.size)],
    asset.width ? ["尺寸", `${asset.width} × ${asset.height}`] : null,
    asset.duration ? ["时长", `${asset.duration.toFixed(2)} s`] : null,
    asset.fps ? ["帧率", `${asset.fps} fps`] : null,
    asset.videoCodec ? ["视频编码", asset.videoCodec] : null,
    asset.audioCodec ? ["音频编码", asset.audioCodec] : null,
    asset.sampleRate ? ["采样率", `${asset.sampleRate} Hz / ${asset.channels} ch`] : null,
    ["修改时间", fmtDate(asset.mtime)],
  ].filter(Boolean);

const drawerHtml = (asset) => {
  const rows = drawerRows(asset);
  let preview = `<div class="thumb-fallback">${TYPE_LABEL[asset.type] ?? "FILE"}</div>`;
  if (asset.type === "video") {
    preview = `<video src="${asset.media}" controls playsinline preload="metadata"></video>`;
  } else if (asset.type === "audio") {
    preview = `<audio src="${asset.media}" controls preload="metadata"></audio>`;
  } else if (asset.type === "image") {
    preview = `<img src="${asset.media}" alt="${esc(asset.name)}" />`;
  } else if (asset.type === "font") {
    preview = `<div class="font-preview">Aa 汉</div>`;
  }
  const snippet = asset.remotion ? `staticFile("${asset.remotion}")` : null;

  return `
    <div class="drawer-backdrop" data-close="1"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div class="drawer__head">
        <div>
          <h2 id="drawer-title">${esc(asset.name)}</h2>
          <p>${esc(asset.path)}</p>
        </div>
        <button class="icon-btn drawer__close" type="button" data-close="1" aria-label="关闭预览">
          ${icon("close")}
        </button>
      </div>
      <div class="drawer__body">
        <div class="preview">${preview}</div>
        <dl class="meta-grid">
          ${rows
            .map(
              ([key, value]) =>
                `<div class="meta-pair"><dt>${esc(key)}</dt><dd title="${esc(value)}">${esc(value)}</dd></div>`,
            )
            .join("")}
        </dl>
        ${
          snippet
            ? `<div class="field"><label for="snippet">REMOTION</label><div class="code" id="snippet">${esc(snippet)}</div></div>`
            : ""
        }
        <div class="field">
          <label for="tags">标签，用逗号分隔</label>
          <input id="tags" value="${esc((asset.user?.tags ?? []).join(", "))}" placeholder="封面, 成片, 待审" />
        </div>
        <div class="field">
          <label for="note">备注</label>
          <textarea id="note" placeholder="记录这一版的用途、问题或下一步。">${esc(asset.user?.note ?? "")}</textarea>
        </div>
        <div class="btn-row">
          <button class="btn btn--primary" id="fav" type="button">
            ${asset.user?.favorite ? "取消收藏" : "收藏素材"}
          </button>
          <button class="btn btn--secondary" id="copy-path" type="button">复制路径</button>
          ${snippet ? '<button class="btn btn--secondary" id="copy-snippet" type="button">复制 staticFile</button>' : ""}
          <button class="btn btn--secondary" id="reveal" type="button">打开目录</button>
          ${
            asset.path.startsWith("local/")
              ? '<button class="btn btn--danger" id="archive" type="button">归档文件</button>'
              : ""
          }
        </div>
      </div>
    </aside>`;
};

const closeDrawer = () => {
  state.selected = null;
  document.body.classList.remove("drawer-open");
  $("#drawer-root").innerHTML = "";
  if (state.lastTrigger?.isConnected) state.lastTrigger.focus();
  state.lastTrigger = null;
};

const trapDrawerFocus = (event) => {
  if (event.key !== "Tab" || !state.selected) return;
  const focusable = $$(
    'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    $(".drawer"),
  ).filter((node) => node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const openDrawer = (path, trigger = null) => {
  const asset = state.data.assets.find((item) => item.path === path);
  if (!asset) return;
  state.selected = asset;
  state.lastTrigger = trigger;
  $("#drawer-root").innerHTML = drawerHtml(asset);
  document.body.classList.add("drawer-open");
  $$("[data-close]").forEach((node) => node.addEventListener("click", closeDrawer));

  $("#tags").addEventListener("change", async (event) => {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    asset.user = { ...asset.user, tags };
    await post("/api/meta", { path: asset.path, ...asset.user });
    renderMain();
    toast("标签已保存");
  });

  $("#note").addEventListener("blur", async (event) => {
    asset.user = { ...asset.user, note: event.target.value };
    await post("/api/meta", { path: asset.path, ...asset.user });
    toast("备注已保存");
  });

  $("#fav").addEventListener("click", async () => {
    asset.user = { ...asset.user, favorite: !asset.user?.favorite };
    await post("/api/meta", { path: asset.path, ...asset.user });
    const current = state.selected;
    closeDrawer();
    renderMain();
    if (current) openDrawer(current.path);
    toast(asset.user.favorite ? "已收藏" : "已取消收藏");
  });

  $("#copy-path").addEventListener("click", () => copy(asset.path));
  $("#copy-snippet")?.addEventListener("click", () => copy(`staticFile("${asset.remotion}")`));
  $("#reveal").addEventListener("click", () => post("/api/reveal", { path: asset.path }));

  $("#archive")?.addEventListener("click", async () => {
    if (!window.confirm(`归档 ${asset.name}？\n文件会移动到 local/archive/，不会删除。`)) return;
    try {
      const result = await post("/api/archive", { path: asset.path });
      closeDrawer();
      await load(true);
      toast(`已归档到 ${result.archivedTo}`);
    } catch (error) {
      toast(error.message);
    }
  });

  $(".drawer__close").focus();
};

const setTab = (tab, { scroll = true } = {}) => {
  if (!Object.hasOwn(TAB_LABELS, tab)) return;
  state.tab = tab;
  history.replaceState(null, "", `?tab=${tab}`);
  render();
  closeMenu();
  closeFilters();
  if (scroll) {
    const view = $("#view");
    const top = view.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo(0, Math.max(0, top));
  }
};

const clearFilters = () => {
  state.type = "all";
  state.group = "all";
  state.favoritesOnly = false;
  state.query = "";
  state.family = "all";
  const search = $("#search");
  if (search) search.value = "";
  renderMain();
};

const openFilters = () => {
  document.body.classList.add("filters-open");
  const close = $("[data-close-filters]");
  close?.focus();
};

const closeFilters = () => {
  document.body.classList.remove("filters-open");
};

const openMenu = () => {
  const menu = $("#mobile-menu");
  menu.hidden = false;
  document.body.classList.add("menu-open");
  $("#menu-toggle").setAttribute("aria-expanded", "true");
  $("#menu-toggle").setAttribute("aria-label", "关闭导航菜单");
  $(".mobile-menu__tab.is-active")?.focus();
};

const closeMenu = () => {
  const menu = $("#mobile-menu");
  menu.hidden = true;
  document.body.classList.remove("menu-open");
  $("#menu-toggle")?.setAttribute("aria-expanded", "false");
  $("#menu-toggle")?.setAttribute("aria-label", "打开导航菜单");
};

const toggleMenu = () => {
  if (document.body.classList.contains("menu-open")) closeMenu();
  else openMenu();
};

$$("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

$$("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.filterType) state.type = button.dataset.filterType;
    setTab(button.dataset.jump);
  });
});

$("#search").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderMain();
});

$("#refresh").addEventListener("click", () => load(true));
$("#mobile-refresh").addEventListener("click", () => {
  closeMenu();
  load(true);
});
$("#menu-toggle").addEventListener("click", toggleMenu);

document.addEventListener("click", (event) => {
  const typeButton = event.target.closest("[data-type]");
  if (typeButton) {
    state.type = typeButton.dataset.type;
    renderMain();
    return;
  }
  const groupButton = event.target.closest("[data-group]");
  if (groupButton) {
    state.group = groupButton.dataset.group;
    renderMain();
    if (window.matchMedia("(max-width: 980px)").matches) closeFilters();
    return;
  }
  const familyButton = event.target.closest("[data-family]");
  if (familyButton) {
    state.family = familyButton.dataset.family;
    renderMain();
    return;
  }
  if (event.target.closest("[data-favorites]")) {
    state.favoritesOnly = !state.favoritesOnly;
    renderMain();
    return;
  }
  if (event.target.closest("[data-rescan]")) {
    load(true);
    return;
  }
  if (event.target.closest("[data-clear-filters]")) {
    clearFilters();
    return;
  }
  if (event.target.closest("[data-open-filters]")) {
    openFilters();
    return;
  }
  if (event.target.closest("[data-close-filters]")) {
    closeFilters();
    return;
  }
  if (event.target.closest("[data-retry]")) {
    load();
    return;
  }
  const open = event.target.closest("[data-open]");
  if (open) {
    openDrawer(open.dataset.open, open);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "sort") {
    state.sort = event.target.value;
    renderMain();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (state.selected) closeDrawer();
    else if (document.body.classList.contains("filters-open")) closeFilters();
    else if (document.body.classList.contains("menu-open")) closeMenu();
  }
  if (event.key === "/" && document.activeElement !== $("#search")) {
    event.preventDefault();
    $("#search").focus();
  }
  if (event.key === "Enter" && event.target.dataset?.open) {
    openDrawer(event.target.dataset.open, event.target);
  }
  trapDrawerFocus(event);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760 && document.body.classList.contains("menu-open")) closeMenu();
  if (window.innerWidth > 980 && document.body.classList.contains("filters-open")) closeFilters();
});

const reel = $("#hero-reel");
const reelWrap = $(".reel");
const reelToggle = $("#reel-toggle");
const reelTime = $("#reel-time");
const reelProgress = $("#reel-progress");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let reelUserPaused = false;

const syncReelState = () => {
  const paused = reel.paused;
  reelWrap?.classList.toggle("is-paused", paused);
  reelToggle?.setAttribute("aria-label", paused ? "继续放映" : "暂停放映");
};

const updateReelTime = () => {
  if (!Number.isFinite(reel.duration) || !reel.duration) return;
  const current = Math.min(reel.currentTime, reel.duration);
  const minutes = Math.floor(current / 60);
  const seconds = Math.floor(current % 60);
  if (reelTime) reelTime.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (reelProgress) reelProgress.style.width = `${(current / reel.duration) * 100}%`;
};

reel?.addEventListener("play", syncReelState);
reel?.addEventListener("pause", syncReelState);
reel?.addEventListener("timeupdate", updateReelTime);
reelToggle?.addEventListener("click", () => {
  if (reel.paused) {
    reelUserPaused = false;
    reel.play().catch(() => {});
  } else {
    reelUserPaused = true;
    reel.pause();
  }
});

if (reel) {
  if (reducedMotion.matches) reel.pause();
  else reel.play().catch(syncReelState);
  syncReelState();
}

if (reelWrap && "IntersectionObserver" in window) {
  const reelObserver = new IntersectionObserver(
    ([entry]) => {
      if (reducedMotion.matches || reelUserPaused) return;
      if (entry.isIntersecting) reel.play().catch(() => {});
      else reel.pause();
    },
    { threshold: 0.12 },
  );
  reelObserver.observe(reelWrap);
}

document.addEventListener("pointerover", (event) => {
  if (reducedMotion.matches) return;
  const card = event.target.closest(".card--button");
  if (!card || card.contains(event.relatedTarget)) return;
  const preview = card.querySelector(".card-preview");
  if (!preview) return;
  if (!preview.getAttribute("src")) preview.src = preview.dataset.preview;
  preview.play().catch(() => {});
});

document.addEventListener("pointerout", (event) => {
  const card = event.target.closest(".card--button");
  if (!card || card.contains(event.relatedTarget)) return;
  const preview = card.querySelector(".card-preview");
  if (preview) preview.pause();
});

load();
