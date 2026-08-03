import React, { useRef, useState } from "react";
import { ImagePlus, Users, Wrench, AlertTriangle, Package } from "lucide-react";

// Nén & thu nhỏ ảnh trước khi lưu, để không vượt giới hạn dung lượng của Firestore (1MB/1 mục).
function nenAnh(file, maxWidth = 1600, chatLuong = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", chatLuong));
      };
      img.onerror = () => reject(new Error("Không đọc được ảnh"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Không đọc được tệp"));
    reader.readAsDataURL(file);
  });
}

export default function TrangChu({ anhNen, onDoiAnh, nhanVien, thietBi, suCo, vatTu }) {
  const [dangTai, setDangTai] = useState(false);
  const [loiAnh, setLoiAnh] = useState("");

  async function xuLyChonAnh(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDangTai(true);
    setLoiAnh("");
    try {
      const base64 = await nenAnh(file);
      onDoiAnh(base64);
    } catch {
      setLoiAnh("Không đọc được ảnh này, thử ảnh khác (JPG/PNG).");
    } finally {
      setDangTai(false);
      e.target.value = "";
    }
  }

  const soSuCoDangXuLy = suCo.filter((s) => s.trangThai === "Đang xử lý").length;
  const soVatTuThieu = vatTu.filter((v) => v.tonKho < v.dinhMuc).length;

  return (
    <section>
      {/* Banner chính */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 flex items-center justify-center text-center border border-slate-200"
        style={{
          minHeight: "340px",
          backgroundImage: anhNen
            ? `linear-gradient(to bottom, rgba(3,18,42,0.55), rgba(3,18,42,0.78)), url(${anhNen})`
            : "linear-gradient(135deg, #0c4a6e 0%, #075985 45%, #0891b2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-6 py-16">
          <div className="text-cyan-200 text-xs sm:text-sm uppercase tracking-[0.35em] font-semibold mb-3">
            Hệ thống quản lý vận hành
          </div>
          <h1 className="text-white font-extrabold leading-tight tracking-tight text-3xl sm:text-5xl drop-shadow-lg">
            NHÀ MÁY THỦY ĐIỆN
            <br />
            SUỐI SẬP 3
          </h1>
          <p className="text-cyan-100 mt-4 text-sm sm:text-base max-w-xl mx-auto">
            Quản lý ca trực, nhân viên, thiết bị, vật tư và hồ sơ vận hành — tập trung, minh bạch, cập nhật thời gian thực.
          </p>
        </div>

        <label className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer shadow transition">
          <ImagePlus size={15} />
          {dangTai ? "Đang tải ảnh..." : anhNen ? "Đổi ảnh nhà máy" : "Thêm ảnh nhà máy"}
          <input type="file" accept="image/*" className="hidden" onChange={xuLyChonAnh} disabled={dangTai} />
        </label>
      </div>

      {loiAnh && <div className="text-sm text-red-600 mb-4 -mt-4">{loiAnh}</div>}

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TheThongKe icon={Users} mau="from-blue-500 to-blue-600" nhan="Nhân viên vận hành" giaTri={nhanVien.length} />
        <TheThongKe icon={Wrench} mau="from-cyan-500 to-cyan-600" nhan="Thiết bị theo dõi" giaTri={thietBi.length} />
        <TheThongKe icon={AlertTriangle} mau="from-amber-500 to-amber-600" nhan="Sự cố đang xử lý" giaTri={soSuCoDangXuLy} />
        <TheThongKe icon={Package} mau="from-rose-500 to-rose-600" nhan="Vật tư dưới định mức" giaTri={soVatTuThieu} />
      </div>
    </section>
  );
}

function TheThongKe({ icon: Icon, mau, nhan, giaTri }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${mau} flex items-center justify-center text-white shrink-0`}>
        <Icon size={19} />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-900 leading-none">{giaTri}</div>
        <div className="text-xs text-slate-500 mt-1">{nhan}</div>
      </div>
    </div>
  );
}
