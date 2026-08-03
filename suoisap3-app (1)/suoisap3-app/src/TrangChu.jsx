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
      {/* Banner chính - toàn màn hình */}
      <div
        className="relative -mx-4 sm:-mx-8 -mt-6 rounded-b-3xl overflow-hidden mb-8 flex items-center justify-center text-center"
        style={{
          minHeight: "calc(100vh - 76px)",
          backgroundImage: anhNen
            ? `linear-gradient(to bottom, rgba(3,18,42,0.5), rgba(3,18,42,0.82)), url(${anhNen})`
            : "linear-gradient(135deg, #041e3a 0%, #075985 45%, #0891b2 80%, #0e7490 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-6 py-16">
          <div className="inline-flex items-center gap-2 text-cyan-200 text-xs sm:text-sm uppercase tracking-[0.35em] font-semibold mb-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            Hệ thống quản lý vận hành
          </div>
          <h1 className="text-white font-extrabold leading-[1.08] tracking-tight text-4xl sm:text-6xl md:text-7xl drop-shadow-2xl">
            QUẢN LÝ VẬN HÀNH
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              NMTĐ SUỐI SẬP 3
            </span>
          </h1>
          <p className="text-cyan-50/90 mt-6 text-sm sm:text-lg max-w-2xl mx-auto">
            Quản lý ca trực, nhân viên, thiết bị, vật tư và hồ sơ vận hành — tập trung, minh bạch, cập nhật thời gian thực.
          </p>
        </div>

        <label className="absolute bottom-6 right-6 inline-flex items-center gap-2 bg-white/90 hover:bg-white text-slate-800 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer shadow-lg transition">
          <ImagePlus size={16} />
          {dangTai ? "Đang tải ảnh..." : anhNen ? "Tải ảnh" : "Tải ảnh"}
          <input type="file" accept="image/*" className="hidden" onChange={xuLyChonAnh} disabled={dangTai} />
        </label>
      </div>

      {loiAnh && <div className="text-sm text-red-600 mb-4">{loiAnh}</div>}

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TheThongKe icon={Users} mau="from-blue-500 to-indigo-600" glow="shadow-blue-500/20" nhan="Nhân viên vận hành" giaTri={nhanVien.length} />
        <TheThongKe icon={Wrench} mau="from-cyan-500 to-teal-600" glow="shadow-cyan-500/20" nhan="Thiết bị theo dõi" giaTri={thietBi.length} />
        <TheThongKe icon={AlertTriangle} mau="from-amber-500 to-orange-600" glow="shadow-amber-500/20" nhan="Sự cố đang xử lý" giaTri={soSuCoDangXuLy} />
        <TheThongKe icon={Package} mau="from-rose-500 to-pink-600" glow="shadow-rose-500/20" nhan="Vật tư dưới định mức" giaTri={soVatTuThieu} />
      </div>
    </section>
  );
}

function TheThongKe({ icon: Icon, mau, glow, nhan, giaTri }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${mau} flex items-center justify-center text-white shrink-0 shadow-lg ${glow}`}>
        <Icon size={19} />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-900 leading-none">{giaTri}</div>
        <div className="text-xs text-slate-500 mt-1">{nhan}</div>
      </div>
    </div>
  );
}
