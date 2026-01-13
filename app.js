// ====== CONFIG ======
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyW3VSPGAmjeRqdLOrtultPJTmGFQDL0UaxyV92SngQHeW5XZZ-AX4v8I3ggFRTjTlq/exec"; // <-- dán URL /exec vào đây

// ====== STATE ======
const state = {
  products: [],
  master: { PhanLoai: [], LoaiHang: [], DonVi: [] },
};

// ====== API ======
async function apiGet(action, params = {}) {
  const url = new URL(GAS_WEBAPP_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

async function apiPost(action, data = {}) {
  const res = await fetch(GAS_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

// ====== UI helpers ======
function $(sel) { return document.querySelector(sel); }
function el(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
function money(v){ v = Number(v||0); return v.toLocaleString("vi-VN"); }

function showTab(tab) {
  document.querySelectorAll("nav button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll("main section").forEach(s => s.classList.add("hidden"));
  $(`#tab-${tab}`).classList.remove("hidden");

  if (tab === "all") renderAllProducts();
  if (tab === "products") renderProductsTab();
  if (tab === "admin") renderAdminTab();
  if (tab === "import") renderImportTab();
  if (tab === "export") renderExportTab();
  if (tab === "check") renderCheckTab();
}

function openModal(contentNode) {
  const root = $("#modalRoot");
  root.classList.remove("hidden");
  root.innerHTML = "";
  const backdrop = el(`<div class="modalBackdrop"></div>`);
  const modal = el(`<div class="modal"></div>`);
  modal.appendChild(contentNode);
  backdrop.appendChild(modal);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  root.appendChild(backdrop);
}

function closeModal() {
  const root = $("#modalRoot");
  root.classList.add("hidden");
  root.innerHTML = "";
}

// ====== INIT ======
async function init() {
  // nav
  document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });

  // load master + products
  await refreshMaster();
  await refreshProducts();

  showTab("all");
}

async function refreshProducts() {
  const r = await apiGet("get_products");
  if (!r.ok) return alert("Lỗi tải sản phẩm: " + r.error);
  state.products = r.data || [];
}

async function refreshMaster() {
  const r = await apiGet("get_master");
  if (!r.ok) return alert("Lỗi tải danh mục: " + r.error);
  state.master = r.data || { PhanLoai: [], LoaiHang: [], DonVi: [] };
}

// ====== Tabs: All products ======
function renderAllProducts() {
  const host = $("#tab-all");
  host.innerHTML = "";

  const phanLoaiOpts = ["", ...state.master.PhanLoai];
  const ui = el(`
    <div class="panel">
      <div class="row">
        <div style="flex:1;min-width:240px">
          <label>Tìm kiếm</label><br/>
          <input id="qAll" placeholder="Nhập tên / OEM / SKU / Id..." style="width:100%"/>
        </div>
        <div>
          <label>Phân loại</label><br/>
          <select id="catAll">
            ${phanLoaiOpts.map(v => `<option value="${v}">${v || "Tất cả"}</option>`).join("")}
          </select>
        </div>
        <button class="btn" id="btnReload">Tải lại</button>
      </div>
      <div class="cardgrid" id="gridAll"></div>
    </div>
  `);
  host.appendChild(ui);

  const qEl = $("#qAll");
  const cEl = $("#catAll");
  const grid = $("#gridAll");

  const draw = () => {
    const q = (qEl.value || "").trim().toLowerCase();
    const cat = cEl.value || "";
    const list = state.products.filter(p => {
      const text = [p.Id,p.OEM,p.SKU,p.OEM_ThayThe,p.TenSanPham,p.PhanLoai,p.LoaiHang].join(" ").toLowerCase();
      const okQ = !q || text.includes(q);
      const okC = !cat || String(p.PhanLoai) === cat;
      return okQ && okC;
    });

    grid.innerHTML = list.map(p => `
      <div class="card">
        <img src="${p.ImageUrl || ""}" alt="">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:8px">
          <span class="badge">${p.PhanLoai || "-"}</span>
          <span class="badge">${p.LoaiHang || "-"}</span>
        </div>
        <h3 style="margin:10px 0 6px;font-size:16px">${p.TenSanPham || "-"}</h3>
        <div style="font-size:13px;color:#374151">
          <div><b>Id:</b> ${p.Id || ""}</div>
          <div><b>OEM:</b> ${p.OEM || ""} <b>SKU:</b> ${p.SKU || ""}</div>
          <div><b>Tồn:</b> ${p.SoLuong || 0} ${p.DonVi || ""}</div>
          <div><b>Giá:</b> ${money(p.GiaTien)} đ</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn gray" data-detail="${p.Id}">Details</button>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll("[data-detail]").forEach(b => {
      b.addEventListener("click", () => showProductDetails(b.dataset.detail));
    });
  };

  qEl.addEventListener("input", draw);
  cEl.addEventListener("change", draw);
  $("#btnReload").addEventListener("click", async () => {
    await refreshProducts();
    draw();
  });

  draw();
}

function showProductDetails(id) {
  const p = state.products.find(x => String(x.Id) === String(id));
  if (!p) return;

  const node = el(`
    <div>
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
        <h2 style="margin:0">${p.TenSanPham || ""}</h2>
        <button class="btn gray" id="btnClose">Đóng</button>
      </div>
      <div class="row" style="margin-top:10px">
        <div style="flex:1;min-width:260px">
          <img src="${p.ImageUrl || ""}" style="width:100%;max-height:360px;object-fit:contain;border-radius:12px;background:#f3f4f6"/>
        </div>
        <div style="flex:1;min-width:260px" class="panel">
          <div><b>Id:</b> ${p.Id || ""}</div>
          <div><b>OEM:</b> ${p.OEM || ""}</div>
          <div><b>SKU:</b> ${p.SKU || ""}</div>
          <div><b>OEM thay thế:</b> ${p.OEM_ThayThe || ""}</div>
          <div><b>Phân loại:</b> ${p.PhanLoai || ""}</div>
          <div><b>Loại hàng:</b> ${p.LoaiHang || ""}</div>
          <div><b>Số lượng:</b> ${p.SoLuong || 0} ${p.DonVi || ""}</div>
          <div><b>Giá:</b> ${money(p.GiaTien)} đ</div>
        </div>
      </div>
    </div>
  `);
  node.querySelector("#btnClose").addEventListener("click", closeModal);
  openModal(node);
}

// Boot
init();
