function renderProductsTab() {
  const host = document.querySelector("#tab-products");
  host.innerHTML = "";

  const phanLoaiOpts = state.master.PhanLoai;
  const loaiHangOpts = state.master.LoaiHang;
  const donViOpts = state.master.DonVi;

  const ui = el(`
    <div class="panel">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
        <h2 style="margin:0">Products</h2>
        <button class="btn" id="btnAdd">+ Thêm sản phẩm</button>
      </div>

      <div style="margin-top:10px" class="row">
        <input id="qProd" placeholder="Tìm theo tên / Id / OEM / SKU..." style="flex:1;min-width:240px"/>
        <button class="btn gray" id="btnReloadProd">Tải lại</button>
      </div>

      <div style="margin-top:10px;overflow:auto">
        <table>
          <thead>
            <tr>
              <th>Id</th><th>Tên</th><th>OEM</th><th>SKU</th><th>Phân loại</th><th>Loại hàng</th><th>Tồn</th><th>Đơn vị</th><th>Giá</th><th></th>
            </tr>
          </thead>
          <tbody id="tbProd"></tbody>
        </table>
      </div>
    </div>
  `);

  host.appendChild(ui);

  const qEl = host.querySelector("#qProd");
  const tb = host.querySelector("#tbProd");

  const draw = () => {
    const q = (qEl.value || "").trim().toLowerCase();
    const list = state.products.filter(p => {
      const text = [p.Id,p.TenSanPham,p.OEM,p.SKU,p.PhanLoai,p.LoaiHang].join(" ").toLowerCase();
      return !q || text.includes(q);
    });

    tb.innerHTML = list.map(p => `
      <tr>
        <td>${p.Id || ""}</td>
        <td>${p.TenSanPham || ""}</td>
        <td>${p.OEM || ""}</td>
        <td>${p.SKU || ""}</td>
        <td>${p.PhanLoai || ""}</td>
        <td>${p.LoaiHang || ""}</td>
        <td>${p.SoLuong || 0}</td>
        <td>${p.DonVi || ""}</td>
        <td>${money(p.GiaTien)} đ</td>
        <td style="white-space:nowrap">
          <button class="btn gray" data-edit="${p.Id}">Sửa</button>
          <button class="btn red" data-del="${p.Id}">Xóa</button>
        </td>
      </tr>
    `).join("");

    tb.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openProductForm(b.dataset.edit)));
    tb.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => delProduct(b.dataset.del)));
  };

  host.querySelector("#btnAdd").addEventListener("click", () => openProductForm(null));
  host.querySelector("#btnReloadProd").addEventListener("click", async () => { await refreshProducts(); draw(); });
  qEl.addEventListener("input", draw);

  draw();

  function openProductForm(id) {
    const p = id ? state.products.find(x => String(x.Id) === String(id)) : null;

    const node = el(`
      <div>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
          <h2 style="margin:0">${p ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
          <button class="btn gray" id="btnClose">Đóng</button>
        </div>

        <div class="row" style="margin-top:10px">
          <div style="flex:1;min-width:260px" class="panel">
            <label>Id (web tạo theo cơ cấu)</label><br/>
            <input id="fId" placeholder="VD: SP-..." style="width:100%" value="${p?.Id || ""}" ${p ? "disabled" : ""}/>

            <div class="row" style="margin-top:8px">
              <div style="flex:1">
                <label>OEM (lọc)</label><br/>
                <input id="fOEM" style="width:100%" value="${p?.OEM || ""}"/>
              </div>
              <div style="flex:1">
                <label>SKU (sp khác)</label><br/>
                <input id="fSKU" style="width:100%" value="${p?.SKU || ""}"/>
              </div>
            </div>

            <label style="margin-top:8px;display:block">Mã OEM thay thế (lọc)</label>
            <input id="fOEMTT" style="width:100%" value="${p?.OEM_ThayThe || ""}"/>

            <label style="margin-top:8px;display:block">Tên sản phẩm</label>
            <input id="fTen" style="width:100%" value="${p?.TenSanPham || ""}"/>

            <div class="row" style="margin-top:8px">
              <div style="flex:1">
                <label>Phân loại</label><br/>
                <select id="fPhanLoai">
                  ${phanLoaiOpts.map(v => `<option ${String(p?.PhanLoai)===String(v)?"selected":""}>${v}</option>`).join("")}
                </select>
              </div>
              <div style="flex:1">
                <label>Loại hàng</label><br/>
                <select id="fLoaiHang">
                  ${loaiHangOpts.map(v => `<option ${String(p?.LoaiHang)===String(v)?"selected":""}>${v}</option>`).join("")}
                </select>
              </div>
            </div>

            <div class="row" style="margin-top:8px">
              <div style="flex:1">
                <label>Số lượng</label><br/>
                <input id="fQty" type="number" style="width:100%" value="${p?.SoLuong || 0}"/>
              </div>
              <div style="flex:1">
                <label>Đơn vị</label><br/>
                <select id="fDonVi">
                  ${donViOpts.map(v => `<option ${String(p?.DonVi)===String(v)?"selected":""}>${v}</option>`).join("")}
                </select>
              </div>
            </div>

            <label style="margin-top:8px;display:block">Giá tiền</label>
            <input id="fGia" type="number" style="width:100%" value="${p?.GiaTien || 0}"/>

            <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
              <button class="btn" id="btnSave">Lưu</button>
              <span id="st" style="color:#6b7280"></span>
            </div>
          </div>

          <div style="flex:1;min-width:260px" class="panel">
            <h3 style="margin-top:0">Hình ảnh</h3>
            <img id="preview" src="${p?.ImageUrl || ""}" style="width:100%;height:260px;object-fit:contain;border-radius:12px;background:#f3f4f6"/>
            <div style="margin-top:10px">
              <input id="fImg" type="file" accept="image/*"/>
              <div style="font-size:12px;color:#6b7280;margin-top:6px">
                Ảnh sẽ upload lên Google Drive (AUTO_PARTS_IMAGES) và tự lấy URL hiển thị.
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    node.querySelector("#btnClose").addEventListener("click", closeModal);

    const imgInput = node.querySelector("#fImg");
    let newImage = null;

    imgInput.addEventListener("change", async () => {
      const file = imgInput.files?.[0];
      if (!file) return;
      node.querySelector("#preview").src = URL.createObjectURL(file);

      // Convert to base64 (remove prefix)
      const base64 = await fileToBase64(file);
      newImage = { filename: file.name, mimeType: file.type, base64 };
    });

    node.querySelector("#btnSave").addEventListener("click", async () => {
      try {
        node.querySelector("#st").textContent = "Đang lưu...";

        const product = {
          Id: node.querySelector("#fId").value.trim(),
          OEM: node.querySelector("#fOEM").value.trim(),
          SKU: node.querySelector("#fSKU").value.trim(),
          OEM_ThayThe: node.querySelector("#fOEMTT").value.trim(),
          TenSanPham: node.querySelector("#fTen").value.trim(),
          PhanLoai: node.querySelector("#fPhanLoai").value,
          LoaiHang: node.querySelector("#fLoaiHang").value,
          SoLuong: Number(node.querySelector("#fQty").value || 0),
          DonVi: node.querySelector("#fDonVi").value,
          GiaTien: Number(node.querySelector("#fGia").value || 0),
        };

        if (!product.Id) return alert("Bạn cần nhập Id (web tạo).");
        if (!product.TenSanPham) return alert("Bạn cần nhập tên sản phẩm.");

        // Upload image if changed
        if (newImage) {
          const up = await apiPost("upload_image_base64", newImage);
          if (!up.ok) throw new Error(up.error || "Upload ảnh lỗi");
          product.ImageId = up.data.fileId;
          product.ImageUrl = up.data.url;
        } else if (p?.ImageUrl) {
          product.ImageId = p.ImageId || "";
          product.ImageUrl = p.ImageUrl || "";
        }

        const r = await apiPost("upsert_product", { product });
        if (!r.ok) throw new Error(r.error);

        await refreshProducts();
        renderAllProducts();
        renderProductsTab();
        closeModal();
      } catch (e) {
        alert(String(e));
      } finally {
        node.querySelector("#st").textContent = "";
      }
    });

    openModal(node);
  }

  async function delProduct(id) {
    if (!confirm("Xóa sản phẩm " + id + " ?")) return;
    const r = await apiPost("delete_product", { id });
    if (!r.ok) return alert(r.error);
    await refreshProducts();
    renderProductsTab();
    renderAllProducts();
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      // remove data:mime;base64,
      const base64 = dataUrl.split(",")[1] || "";
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

// ===== Nhập hàng / Xuất hàng / Kiểm tra hàng =====
function renderImportTab() {
  const host = document.querySelector("#tab-import");
  host.innerHTML = "";

  const ui = el(`
    <div class="panel">
      <h2 style="margin-top:0">Nhập hàng</h2>
      <div class="row">
        <input id="iOEM" placeholder="OEM/SKU" style="min-width:180px"/>
        <input id="iTen" placeholder="Tên sản phẩm" style="flex:1;min-width:220px"/>
        <input id="iNgay" type="date"/>
        <input id="iQty" type="number" placeholder="Số lượng" style="width:140px"/>
        <input id="iDonVi" placeholder="Đơn vị" style="width:140px"/>
        <input id="iIdSP" placeholder="Id sản phẩm (để cộng tồn)" style="width:210px"/>
        <button class="btn" id="btnImport">Ghi nhập</button>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-top:6px">
        Gợi ý: nhập <b>Id sản phẩm</b> để hệ thống tự cộng tồn vào sheet SanPham.
      </div>
    </div>
  `);
  host.appendChild(ui);

  host.querySelector("#btnImport").addEventListener("click", async () => {
    const item = {
      OEM_SKU: host.querySelector("#iOEM").value.trim(),
      TenSanPham: host.querySelector("#iTen").value.trim(),
      NgayNhap: host.querySelector("#iNgay").value ? new Date(host.querySelector("#iNgay").value) : new Date(),
      SoLuong: Number(host.querySelector("#iQty").value || 0),
      DonVi: host.querySelector("#iDonVi").value.trim(),
      IdSanPham: host.querySelector("#iIdSP").value.trim(),
    };
    const r = await apiPost("add_import", { item });
    if (!r.ok) return alert(r.error);
    alert("Đã ghi nhập!");
    await refreshProducts();
    renderAllProducts();
  });
}

function renderExportTab() {
  const host = document.querySelector("#tab-export");
  host.innerHTML = "";

  const ui = el(`
    <div class="panel">
      <h2 style="margin-top:0">Xuất hàng</h2>
      <div class="row">
        <input id="eOEM" placeholder="OEM/SKU" style="min-width:180px"/>
        <input id="eTen" placeholder="Tên sản phẩm" style="flex:1;min-width:220px"/>
        <input id="eQty" type="number" placeholder="Số lượng" style="width:140px"/>
        <input id="eDonVi" placeholder="Đơn vị" style="width:140px"/>
        <input id="eNgay" type="date"/>
        <input id="eKhach" placeholder="Tên khách hàng" style="min-width:180px"/>
        <input id="eIdSP" placeholder="Id sản phẩm (để trừ tồn)" style="width:210px"/>
        <button class="btn" id="btnExport">Ghi xuất</button>
      </div>
    </div>
  `);
  host.appendChild(ui);

  host.querySelector("#btnExport").addEventListener("click", async () => {
    const item = {
      OEM_SKU: host.querySelector("#eOEM").value.trim(),
      TenSanPham: host.querySelector("#eTen").value.trim(),
      SoLuong: Number(host.querySelector("#eQty").value || 0),
      DonVi: host.querySelector("#eDonVi").value.trim(),
      NgayXuat: host.querySelector("#eNgay").value ? new Date(host.querySelector("#eNgay").value) : new Date(),
      TenKhachHang: host.querySelector("#eKhach").value.trim(),
      IdSanPham: host.querySelector("#eIdSP").value.trim(),
    };
    const r = await apiPost("add_export", { item });
    if (!r.ok) return alert(r.error);
    alert("Đã ghi xuất!");
    await refreshProducts();
    renderAllProducts();
  });
}

function renderCheckTab() {
  const host = document.querySelector("#tab-check");
  host.innerHTML = "";

  const ui = el(`
    <div class="panel">
      <h2 style="margin-top:0">Kiểm tra hàng</h2>
      <div class="row">
        <input id="cTen" placeholder="Tên sản phẩm" style="flex:1;min-width:240px"/>
        <input id="cTon" type="number" placeholder="Số lượng tồn" style="width:160px"/>
        <input id="cNgay" type="date"/>
        <button class="btn" id="btnCheck">Lưu + tạo Google Doc</button>
      </div>
      <div id="checkResult" style="margin-top:10px"></div>
    </div>
  `);
  host.appendChild(ui);

  host.querySelector("#btnCheck").addEventListener("click", async () => {
    const item = {
      TenSanPham: host.querySelector("#cTen").value.trim(),
      SoLuongTon: Number(host.querySelector("#cTon").value || 0),
      NgayKiemTra: host.querySelector("#cNgay").value ? new Date(host.querySelector("#cNgay").value) : new Date(),
    };
    const r = await apiPost("add_stockcheck", { item });
    if (!r.ok) return alert(r.error);

    host.querySelector("#checkResult").innerHTML = `
      <div class="panel">
        <div><b>Đã lưu kiểm tra!</b></div>
        <div>Google Doc: <a href="${r.data.docUrl}" target="_blank">${r.data.docUrl}</a></div>
      </div>
    `;
  });
}
