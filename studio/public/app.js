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
};

const initialTab = new URLSearchParams(location.search).get("tab");
if (["library", "styles", "sources"].includes(initialTab)) state.tab = initialTab;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"};
    return map[char];
  });

const fmtBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
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

const TYPE_LABEL = {
  video: "VIDEO",
  audio: "AUDIO",
  image: "IMAGE",
  font: "FONT",
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
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "request failed");
  }
  return response.json();
};

const load = async (silent = false) => {
  if (!silent) state.loading = true;
  try {
    const response = await fetch("/api/bootstrap", {cache: "no-store"});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    state.loading = false;
    render();
    const openPath = new URLSearchParams(location.search).get("open");
    if (openPath && !state.selected) openDrawer(openPath);
    if (silent) toast("已重新扫描");
  } catch (error) {
    state.loading = false;
    $("#main").innerHTML = `<div class="empty">加载失败：${esc(error.message)}</div>`;
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
  const groupRows = data.groups
    .map(
      (group) => `
      <button class="filter ${state.group === group.id ? "is-active" : ""}" data-group="${group.id}">
        <span>${esc(group.label)}</span><small>${group.count}</small>
      </button>`,
    )
    .join("");

  $("#sidebar").innerHTML = `
    <div class="side-block">
      <div class="side-title">LIBRARY SIZE</div>
      <div class="side-strong">${fmtBytes(totalBytes)}</div>
      <div class="side-sub">${data.assets.length} 个文件 · ${data.groups.length} 个目录</div>
    </div>
    <div class="side-block">
      <div class="side-title">FILTER / 目录</div>
      <button class="filter ${state.group === "all" ? "is-active" : ""}" data-group="all">
        <span>全部素材</span><small>${data.assets.length}</small>
      </button>
      ${groupRows}
    </div>
    <div class="side-block">
      <div class="side-title">QUICK</div>
      <button class="filter ${state.favoritesOnly ? "is-active" : ""}" data-favorites="1">
        <span>★ 收藏</span><small>${favorites}</small>
      </button>
      <button class="filter" data-rescan="1">
        <span>↻ 重新扫描</span><small>FS</small>
      </button>
    </div>
    <div class="side-block">
      <div class="side-title">OUTPUT</div>
      <div class="side-sub">渲染输出统一在 <b>local/out</b>。<br />归档会移动到 <b>local/archive</b>。</div>
    </div>`;
};

const thumbHtml = (asset) => {
  if (asset.type === "audio") {
    const bars = Array.from({length: 30}, (_, index) => {
      const seed = (asset.name.charCodeAt(index % asset.name.length) * 17 + index * 31) % 70;
      return `<i style="height:${18 + seed}%"></i>`;
    }).join("");
    return `<div class="wave">${bars}</div>`;
  }
  if (asset.type === "font") {
    return `<div class="thumb-fallback" style="background:var(--paper);color:var(--ink);font-size:64px">Aa</div>`;
  }
  if (asset.thumb) {
    return `<img loading="lazy" src="${asset.thumb}" alt="${esc(asset.name)}" />`;
  }
  return `<div class="thumb-fallback">${TYPE_LABEL[asset.type] ?? "FILE"}</div>`;
};

const assetCard = (asset) => `
  <article class="card" data-open="${esc(asset.path)}" tabindex="0" role="button">
    <div class="thumb">
      ${thumbHtml(asset)}
      <span class="type-badge">${TYPE_LABEL[asset.type] ?? "FILE"}</span>
      ${asset.duration ? `<span class="duration-badge">${fmtDuration(asset.duration)}</span>` : ""}
      ${asset.user?.favorite ? '<span class="fav-mark">★</span>' : ""}
    </div>
    <div class="card-body">
      <div class="card-title" title="${esc(asset.name)}">${esc(asset.name)}</div>
      <div class="card-path" title="${esc(asset.path)}">${esc(asset.path)}</div>
      <div class="card-meta">
        <span>${fmtBytes(asset.size)}</span>
        ${asset.width ? `<span>· ${asset.width}×${asset.height}</span>` : ""}
        ${asset.fps ? `<span>· ${asset.fps}fps</span>` : ""}
        ${asset.sampleRate ? `<span>· ${asset.sampleRate / 1000}kHz</span>` : ""}
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
        <div class="view-kicker">LOCAL ASSETS / ${items.length}</div>
        <h1 class="view-title">素材库</h1>
      </div>
      <div class="view-note">成片、QC 帧、旁白、音效、封面都从这里统一查看。收藏、标签和备注写入本地索引，不会进仓库。</div>
    </div>
    <div class="toolbar">
      ${types
        .map(
          (type) =>
            `<button class="chip ${state.type === type ? "is-active" : ""}" data-type="${type}">${
              type === "all" ? "全部" : TYPE_LABEL[type]
            } <small>${typeCount(type)}</small></button>`,
        )
        .join("")}
      <span class="spacer"></span>
      <select class="select" id="sort">
        <option value="recent" ${state.sort === "recent" ? "selected" : ""}>最近修改</option>
        <option value="size" ${state.sort === "size" ? "selected" : ""}>文件大小</option>
        <option value="name" ${state.sort === "name" ? "selected" : ""}>名称</option>
        <option value="duration" ${state.sort === "duration" ? "selected" : ""}>时长</option>
      </select>
    </div>
    ${items.length ? `<div class="grid">${items.map(assetCard).join("")}</div>` : '<div class="empty">没有匹配的素材</div>'}`;
};

const paletteDots = (palette) => {
  if (!palette) return "";
  return `<div class="dots">${["bg", "accent", "accent2", "ink"]
    .map((key) => `<i style="background:${palette.colors[key]}"></i>`)
    .join("")}</div>`;
};

const renderStyles = () => {
  const catalog = state.data.catalog;
  if (!catalog) return '<div class="empty">catalog 未生成</div>';
  const query = state.query.trim().toLowerCase();
  const palettes = catalog.palettes;
  const packs = catalog.packs ?? [];
  const paletteById = Object.fromEntries(palettes.map((palette) => [palette.id, palette]));

  const styles = catalog.styles.filter((style) => {
    if (state.family !== "all" && style.family !== state.family) return false;
    if (!query) return true;
    return `${style.name} ${style.english ?? ""} ${style.technique ?? ""} ${style.visual ?? ""}`
      .toLowerCase()
      .includes(query);
  });

  return `
    <div class="view-head">
      <div>
        <div class="view-kicker">CATALOG / ${catalog.styles.length} STYLES · ${packs.length} PACKS</div>
        <h1 class="view-title">设计资产</h1>
      </div>
      <div class="view-note">来自 Huashu Art Motion 与本仓库原创风格包的可检索目录。</div>
    </div>

    <section class="section">
      <div class="section-head"><h2>风格包</h2><span>${packs.length} PACKS</span></div>
      <div class="style-grid">
        ${packs
          .map((pack) => `
          <article class="style-card">
            <div class="style-card-top">
              <span class="family original">PACK</span>
              <span class="stars">${esc(pack.status.toUpperCase())}</span>
            </div>
            <div class="style-name">${esc(pack.name)}</div>
            <div class="style-original">${esc(pack.id)}</div>
            <div class="style-line"><b>预览</b> ${esc(pack.previewComposition)}</div>
            <div class="style-line"><b>入口</b> ${esc(pack.entry)}</div>
            <div class="style-line"><b>色板</b> ${esc(pack.palette)}</div>
          </article>`)
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>色板</h2><span>${palettes.length} PALETTES</span></div>
      <div class="palette-grid">
        ${palettes
          .map(
            (palette) => `
          <div class="palette-card">
            <div class="palette-title">${esc(palette.name)} <span>${esc(palette.id)}</span></div>
            <div class="swatches">
              ${["bg", "surface", "ink", "sub", "accent", "accent2"]
                .map((key) => `<div class="swatch" style="background:${palette.colors[key]}" title="${key} ${palette.colors[key]}"></div>`)
                .join("")}
            </div>
            <div class="palette-note">${esc(palette.bestFor)}</div>
          </div>`,
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>风格</h2><span>${styles.length} MATCHED</span></div>
      <div class="toolbar">
        ${["all", "original", "huashu"]
          .map(
            (family) =>
              `<button class="chip ${state.family === family ? "is-active" : ""}" data-family="${family}">${
                family === "all"
                  ? "全部"
                  : family === "original"
                    ? "原创"
                    : "花叔 / 36"
              }</button>`,
          )
          .join("")}
      </div>
      <div class="style-grid">
        ${styles
          .map((style) => {
            const link = githubFor(style.source);
            const palette = style.palette ? paletteById[style.palette] : null;
            const familyLabel = style.family === "original" ? "原创" : "花叔";
            const lineA = `<b>手法</b> ${esc(style.technique ?? "")}`;
            const lineB = `<b>母题</b> ${esc(style.motion ?? "")}`;
            const lineC = `<b>短板</b> ${esc(style.weakness ?? "")}`;
            return `
            <article class="style-card">
              <div class="style-card-top">
                <span class="family ${style.family}">${familyLabel}</span>
                <span class="stars">${"★".repeat(style.quality)}</span>
              </div>
              <div class="style-name">${esc(style.name)}</div>
              <div class="style-original">${esc(style.english ?? style.id)}</div>
              <div class="style-line">${lineA}</div>
              <div class="style-line">${lineB}</div>
              <div class="style-line">${lineC}</div>
              <div class="style-foot">
                ${paletteDots(palette)}
                ${link ? `<a class="src-link" href="${link}" target="_blank" rel="noreferrer">SOURCE ↗</a>` : ""}
              </div>
            </article>`;
          })
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>动画语法</h2><span>${catalog.grammars.length} GRAMMARS</span></div>
      <div class="grammar-grid">
        ${catalog.grammars
          .map(
            (grammar) => `
          <article class="grammar-card">
            <div class="grammar-id">${esc(grammar.id.toUpperCase())}</div>
            <div class="grammar-name">${esc(grammar.name)}</div>
            <div class="grammar-line">${esc(grammar.oneLiner)}</div>
          </article>`,
          )
          .join("")}
      </div>
    </section>`;
};

const renderSources = () => {
  const catalog = state.data.catalog;
  return `
    <div class="view-head">
      <div>
        <div class="view-kicker">SOURCES / LICENSES</div>
        <h1 class="view-title">来源与许可</h1>
      </div>
      <div class="view-note">包含原创风格包，以及 Huashu Art Motion 的设计与方法来源；不搬运第三方成片、角色或样片素材。</div>
    </div>
    <div class="source-grid">
      ${catalog.sources
        .map(
          (source) => `
        <article class="source-card">
          <div class="family">${esc(source.license)}</div>
          <h3>${esc(source.name)}</h3>
          <div class="source-meta">${esc(source.author)} · ${esc(source.usage)}</div>
          <div class="style-line">${esc(source.note)}</div>
          ${
            /^https?:\/\//.test(source.repo)
              ? `<a class="src-link" href="${source.repo}" target="_blank" rel="noreferrer">${esc(source.repo)} ↗</a>`
              : `<div class="src-link">${esc(source.repo)}</div>`
          }
        </article>`,
        )
        .join("")}
    </div>
    <section class="section" style="margin-top:32px">
      <div class="section-head"><h2>取用边界</h2><span>WHAT WE TOOK</span></div>
      <div class="notice">
        <b>取用：</b>36 张风格卡、9 张语法卡、8 套色板、方法文档与 OFL 字体。<br />
        <b>重写：</b>所有 Remotion 组件都在本工程内重新实现，没有复制对方的渲染器或网页源码。<br />
        <b>未取用：</b>对方的成片、GIF 样片、角色、字体文件与品牌素材。<br />
        Huashu Art Motion 代码与文档为 MIT，字体为 SIL OFL 1.1，完整版权声明见仓库根目录 <b>THIRD_PARTY_NOTICES.md</b>。
      </div>
    </section>
    </section>`;
};

const renderMain = () => {
  if (state.loading || !state.data) return;
  renderSidebar();
  const main = $("#main");
  if (state.tab === "library") main.innerHTML = renderLibrary();
  if (state.tab === "styles") main.innerHTML = renderStyles();
  if (state.tab === "sources") main.innerHTML = renderSources();
};

const render = () => {
  if (state.loading || !state.data) return;
  $$(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === state.tab));
  renderMain();
};

const drawerHtml = (asset) => {
  const rows = [
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

  let preview = `<div class="thumb-fallback" style="height:200px">${TYPE_LABEL[asset.type] ?? "FILE"}</div>`;
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
    <aside class="drawer" role="dialog" aria-modal="true">
      <div class="drawer-head">
        <div>
          <h2>${esc(asset.name)}</h2>
          <p>${esc(asset.path)}</p>
        </div>
        <button class="drawer-close" data-close="1" title="关闭（Esc）">×</button>
      </div>
      <div class="drawer-body">
        <div class="preview">${preview}</div>
        <table class="meta-table">
          ${rows.map(([key, value]) => `<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`).join("")}
        </table>
        ${snippet ? `<div class="field"><label>REMOTION</label><div class="code">${esc(snippet)}</div></div>` : ""}
        <div class="field">
          <label>TAGS / 逗号分隔</label>
          <input id="tags" value="${esc((asset.user?.tags ?? []).join(", "))}" placeholder="封面, 成片, 待审" />
        </div>
        <div class="field">
          <label>NOTE</label>
          <textarea id="note" placeholder="记录这一版的用途、问题或下一步…">${esc(asset.user?.note ?? "")}</textarea>
        </div>
        <div class="btn-row">
          <button class="btn primary" id="fav">${asset.user?.favorite ? "★ 已收藏" : "☆ 收藏"}</button>
          <button class="btn" id="copy-path">复制路径</button>
          ${snippet ? '<button class="btn" id="copy-snippet">复制 staticFile</button>' : ""}
          <button class="btn" id="reveal">打开目录</button>
          ${asset.path.startsWith("local/") ? '<button class="btn danger" id="archive">归档</button>' : ""}
        </div>
      </div>
    </aside>`;
};

const closeDrawer = () => {
  state.selected = null;
  $("#drawer-root").innerHTML = "";
};

const openDrawer = (path) => {
  const asset = state.data.assets.find((item) => item.path === path);
  if (!asset) return;
  state.selected = asset;
  $("#drawer-root").innerHTML = drawerHtml(asset);
  $$("[data-close]").forEach((node) => node.addEventListener("click", closeDrawer));

  $("#tags").addEventListener("change", async (event) => {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    asset.user = {...asset.user, tags};
    await post("/api/meta", {path: asset.path, ...asset.user});
    renderMain();
    toast("标签已保存");
  });

  $("#note").addEventListener("blur", async (event) => {
    asset.user = {...asset.user, note: event.target.value};
    await post("/api/meta", {path: asset.path, ...asset.user});
    toast("备注已保存");
  });

  $("#fav").addEventListener("click", async () => {
    asset.user = {...asset.user, favorite: !asset.user?.favorite};
    await post("/api/meta", {path: asset.path, ...asset.user});
    const current = state.selected;
    closeDrawer();
    renderMain();
    if (current) openDrawer(current.path);
    toast(asset.user.favorite ? "已收藏" : "已取消收藏");
  });

  $("#copy-path").addEventListener("click", () => copy(asset.path));
  $("#copy-snippet")?.addEventListener("click", () => copy(`staticFile("${asset.remotion}")`));
  $("#reveal").addEventListener("click", () => post("/api/reveal", {path: asset.path}));

  $("#archive")?.addEventListener("click", async () => {
    if (!window.confirm(`归档 ${asset.name}？\n文件会移动到 local/archive/，不会删除。`)) return;
    try {
      const result = await post("/api/archive", {path: asset.path});
      closeDrawer();
      await load(true);
      toast(`已归档到 ${result.archivedTo}`);
    } catch (error) {
      toast(error.message);
    }
  });
};

$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.tab = tab.dataset.tab;
    history.replaceState(null, "", `?tab=${state.tab}`);
    render();
  });
});

$("#search").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderMain();
});

$("#refresh").addEventListener("click", () => load(true));

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
  const open = event.target.closest("[data-open]");
  if (open) {
    openDrawer(open.dataset.open);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "sort") {
    state.sort = event.target.value;
    renderMain();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
  if (event.key === "/" && document.activeElement !== $("#search")) {
    event.preventDefault();
    $("#search").focus();
  }
  if (event.key === "Enter" && event.target.dataset?.open) {
    openDrawer(event.target.dataset.open);
  }
});

load();
