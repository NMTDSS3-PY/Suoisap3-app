import React, { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";

// Ô ký tên: cho phép ký bằng chuột (máy tính) hoặc ngón tay (điện thoại/máy tính bảng).
// value: chuỗi base64 ảnh chữ ký (data URL) đã lưu trước đó, hoặc rỗng.
// onChange(dataUrl): gọi mỗi khi người dùng ký xong 1 nét hoặc bấm Xóa.
export default function ChuKyPad({ label, value, onChange }) {
  const canvasRef = useRef(null);
  const dangVeRef = useRef(false);
  const diemTruocRef = useRef({ x: 0, y: 0 });

  // Vẽ lại chữ ký đã lưu (nếu có) khi tải trang / khi dữ liệu từ máy chủ về tới.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = value;
    }
  }, [value]);

  function layToaDo(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const cy = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
    return {
      x: ((cx - rect.left) / rect.width) * canvas.width,
      y: ((cy - rect.top) / rect.height) * canvas.height,
    };
  }

  function batDauKy(e) {
    e.preventDefault();
    dangVeRef.current = true;
    diemTruocRef.current = layToaDo(e);
  }

  function dangKy(e) {
    if (!dangVeRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const diemMoi = layToaDo(e);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(diemTruocRef.current.x, diemTruocRef.current.y);
    ctx.lineTo(diemMoi.x, diemMoi.y);
    ctx.stroke();
    diemTruocRef.current = diemMoi;
  }

  function ketThucKy() {
    if (!dangVeRef.current) return;
    dangVeRef.current = false;
    const canvas = canvasRef.current;
    onChange(canvas.toDataURL("image/png"));
  }

  function xoaChuKy() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-slate-500">{label}</span>}
      <div className="border border-dashed border-slate-300 rounded-md bg-white">
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          className="w-full touch-none cursor-crosshair rounded-md"
          style={{ height: 120 }}
          onMouseDown={batDauKy}
          onMouseMove={dangKy}
          onMouseUp={ketThucKy}
          onMouseLeave={ketThucKy}
          onTouchStart={batDauKy}
          onTouchMove={dangKy}
          onTouchEnd={ketThucKy}
        />
      </div>
      <button
        type="button"
        onClick={xoaChuKy}
        className="self-start flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition"
      >
        <Eraser size={12} /> Xóa chữ ký, ký lại
      </button>
    </div>
  );
}
