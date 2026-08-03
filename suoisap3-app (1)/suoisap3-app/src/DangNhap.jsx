import React, { useState } from "react";
import { Lock, Zap } from "lucide-react";
import { MAT_KHAU_HE_THONG } from "./config";

export default function DangNhap({ onDangNhapThanhCong }) {
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState("");

  function xuLySubmit(e) {
    e.preventDefault();
    if (matKhau === MAT_KHAU_HE_THONG) {
      sessionStorage.setItem("ss3_da_dang_nhap", "true");
      setLoi("");
      onDangNhapThanhCong();
    } else {
      setLoi("Sai mật khẩu. Vui lòng thử lại.");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-indigo-900 to-cyan-700 px-4"
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <Zap className="text-white" size={26} fill="white" />
          </div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-blue-600 font-semibold">
            Nhà máy thủy điện
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 text-center tracking-tight">
            Suối Sập 3
          </h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Đăng nhập hệ thống quản lý vận hành
          </p>
        </div>

        <form onSubmit={xuLySubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Mật khẩu</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoFocus
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loi && <div className="text-sm text-red-600">{loi}</div>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition shadow-md shadow-blue-500/20"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-5">
          Chỉ dùng nội bộ tổ vận hành nhà máy.
        </p>
      </div>
    </div>
  );
}
