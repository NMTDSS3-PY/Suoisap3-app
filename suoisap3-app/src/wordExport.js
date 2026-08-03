// Xuất biên bản bàn giao ca ra file Word (.doc).
// Dùng kỹ thuật HTML -> .doc (Word đọc được trực tiếp), không cần cài thêm thư viện nặng.

export function xuatBanGiaoWord(bg) {
  const ngayDep = bg.ngay
    ? new Date(bg.ngay).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>Bien ban ban giao ca</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: 21cm 29.7cm; margin: 2cm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #111; }
  h1 { text-align: center; font-size: 16pt; margin-bottom: 2px; text-transform: uppercase; }
  .center { text-align: center; }
  .sub { text-align: center; font-style: italic; margin-bottom: 18px; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
  td, th { border: 1px solid #000; padding: 7px 10px; vertical-align: top; }
  td.label { width: 30%; font-weight: bold; background: #f2f2f2; }
  .kyten { border: none !important; text-align: center; width: 50%; padding-top: 40px; }
  .kytenwrap td { border: none; }
</style>
</head>
<body>
  <p class="center"><b>NHÀ MÁY THỦY ĐIỆN SUỐI SẬP 3</b></p>
  <h1>Biên bản bàn giao ca trực</h1>
  <p class="sub">Ngày ${ngayDep || "……………"}</p>

  <table>
    <tr><td class="label">Ngày trực</td><td>${escapeHtml(ngayDep)}</td></tr>
    <tr><td class="label">Ca trực</td><td>${escapeHtml(bg.ca || "")}</td></tr>
    <tr><td class="label">Người giao ca</td><td>${escapeHtml(bg.nguoiGiao || "")}</td></tr>
    <tr><td class="label">Người nhận ca</td><td>${escapeHtml(bg.nguoiNhan || "")}</td></tr>
    <tr><td class="label">Thông số vận hành</td><td>${escapeHtml(bg.thongSo || "").replace(/\n/g, "<br/>")}</td></tr>
    <tr><td class="label">Sự cố / bất thường</td><td>${escapeHtml(bg.suCo || "Không có").replace(/\n/g, "<br/>")}</td></tr>
    <tr><td class="label">Ghi chú bàn giao</td><td>${escapeHtml(bg.ghiChu || "").replace(/\n/g, "<br/>")}</td></tr>
  </table>

  <table class="kytenwrap" style="margin-top: 40px;">
    <tr>
      <td class="kyten"><b>NGƯỜI GIAO CA</b><br/>(Ký, ghi rõ họ tên)<br/>
        ${bg.chuKyGiao ? `<img src="${bg.chuKyGiao}" style="height:65px;" />` : "<br/><br/><br/>"}
        <br/>${escapeHtml(bg.nguoiGiao || "")}
      </td>
      <td class="kyten"><b>NGƯỜI NHẬN CA</b><br/>(Ký, ghi rõ họ tên)<br/>
        ${bg.chuKyNhan ? `<img src="${bg.chuKyNhan}" style="height:65px;" />` : "<br/><br/><br/>"}
        <br/>${escapeHtml(bg.nguoiNhan || "")}
      </td>
    </tr>
  </table>
</body>
</html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BienBan_BanGiaoCa_${bg.ngay || "chuaco"}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
