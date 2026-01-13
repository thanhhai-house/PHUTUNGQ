function renderAdminTab() {
  const host = document.querySelector("#tab-admin");
  host.innerHTML = "";

  const ui = el(`
    <div class="panel">
      <h2 style="margin-top:0">Admin</h2>

      <div class="row">
        <div class="panel" style="flex:1;min-width:260px">
          <h3 style="margin-top:0">Thêm danh mục</h3>
          <select id="mType">
            <option value="PhanLoai">Phân loại</option>
            <option value="LoaiHang">Loại hàng</option>
            <option value="DonVi">Đơn vị</option>
          </select>
          <input id="mValue" placeholder="Nhập giá trị..." style="flex:1;min-width:180px"/>
          <button class="btn" id="btnAddM">Thêm</button>

          <div style="margin-top:10px">
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <div style="flex:1;min-width:200px">
                <b>Phân loại</b>
                <ul id="listPL"></ul>
              </div>
              <div style="flex:1;min-width:200px">
                <b>Loại hàng</b>
                <ul id="listLH"></ul>
              </div>
              <div style="flex:1;min-width:200px">
                <b>Đơn vị</b>
                <ul id="listDV"></ul>
              </div>
            </div>
          </div>
        </div>

        <div class="panel" style="flex:1;min-width:260px">
          <h3 style="margin-top:0">Cập nhật giá sản phẩm</h3>
          <div class="row">
            <input id="pId" placeholder="Id sản phẩm" style="min-width:200px"/>
            <input id="pGia" type="number" placeholder="Giá tiền" style="min-width:180px"/>
            <button class="btn" id="btnUpdate1">Cập nhật</button>
          </div>
          <div style="font-size:12px;color:#6b7280;margin-top:6px">
            Cần cập nhật hàng loạt? Bạn có thể mở rộng theo CSV sau.
          </div>
        </div>
      </div>
    </div>
  `);

  host.appendChild(ui);

  function drawLists() {
    const mk = (type, arr) => arr.map(v => `
      <li style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin:6px 0">
        <span>${v}</span>
        <button class="btn red" data-del="${type}||${v}" style="padding:6px 10px;border-radius:10px">X</button>
      </li>
    `).join("");

    host.querySelector("#listPL").innerHTML = mk("PhanLoai", state.master.PhanLoai);
    host.querySelector("#listLH").innerHTML = mk("LoaiHang", state.master.LoaiHang);
    host.querySelector("#listDV").innerHTML = mk("DonVi", state.master.DonVi);

    host.querySelectorAll("[data-del]").forEach(b => {
      b.addEventListener("click", async () => {
        const [type, value] = b.dataset.del.split("||");
        const r = await apiPost("delete_master_item", { type, value });
        if (!r.ok) return alert(r.error);
        await refreshMaster();
        renderProductsTab(); // refresh dropdowns in forms
        renderAllProducts();
        drawLists();
      });
    });
  }

  drawLists();

  host.querySelector("#btnAddM").addEventListener("click", async () => {
    const type = host.querySelector("#mType").value;
    const value = host.querySelector("#mValue").value.trim();
    if (!value) return alert("Nhập giá trị cần thêm");

    const r = await apiPost("add_master_item", { type, value });
    if (!r.ok) return alert(r.error);

    host.querySelector("#mValue").value = "";
    await refreshMaster();
    renderProductsTab();
    drawLists();
  });

  host.querySelector("#btnUpdate1").addEventListener("click", async () => {
    const Id = host.querySelector("#pId").value.trim();
    const GiaTien = Number(host.querySelector("#pGia").value || 0);
    if (!Id) return alert("Nhập Id sản phẩm");

    const r = await apiPost("bulk_update_prices", { items: [{ Id, GiaTien }] });
    if (!r.ok) return alert(r.error);

    alert("Đã cập nhật giá!");
    await refreshProducts();
    renderAllProducts();
    renderProductsTab();
  });
}
