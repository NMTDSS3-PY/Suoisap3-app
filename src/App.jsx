import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { storageGet, storageSet } from "./storage";
import { Plus, X, ChevronLeft, ChevronRight, AlertTriangle, Users, ClipboardList, ArrowRightLeft, Wrench, Package, FolderOpen, Search, Activity } from "lucide-react";

const CA_LIST = ["Ca 1 (07:30-15:00)", "Ca 2 (15:00-22:00)", "Ca 3 (22:00-07:30)"];
const VI_TRI = ["Trực chính", "Trực phụ", "Trưởng ca"];

const NHAN_VIEN_MAU = [
  { id: 1, ten: "Mà Mạnh Trường", chucVu: "Kỹ thuật viên", to: "Tổ vận hành A" },
  { id: 2, ten: "Nguyễn Văn Hải", chucVu: "Trưởng ca", to: "Tổ vận hành A" },
  { id: 3, ten: "Lê Thị Hương", chucVu: "Kỹ thuật viên", to: "Tổ vận hành B" },
  { id: 4, ten: "Phạm Đức Anh", chucVu: "Kỹ thuật viên", to: "Tổ vận hành B" },
  { id: 5, ten: "Trần Quốc Bảo", chucVu: "Trưởng ca", to: "Tổ vận hành C" },
];

const THIET_BI_MAU = [
  { id: 1, ma: "TB-001", ten: "Turbine tổ máy H1", khuVuc: "Nhà máy chính", trangThai: "Hoạt động", lanBaoTriCuoi: "2026-06-12", phuTrach: "Nguyễn Văn Hải" },
  { id: 2, ma: "TB-002", ten: "Máy biến áp T1", khuVuc: "Trạm phân phối", trangThai: "Hoạt động", lanBaoTriCuoi: "2026-05-20", phuTrach: "Trần Quốc Bảo" },
  { id: 3, ma: "TB-003", ten: "Van xả đáy số 2", khuVuc: "Đập tràn", trangThai: "Cần kiểm tra", lanBaoTriCuoi: "2026-03-01", phuTrach: "Mà Mạnh Trường" },
  { id: 4, ma: "TB-004", ten: "Bơm dầu bôi trơn", khuVuc: "Nhà máy chính", trangThai: "Hoạt động", lanBaoTriCuoi: "2026-07-02", phuTrach: "Lê Thị Hương" },
];

const SU_CO_MAU = [
  {
    id: 1,
    ngay: "2026-07-15",
    thietBi: "Van xả đáy số 2",
    moTa: "Rò rỉ nhẹ tại gioăng cao su, chưa ảnh hưởng vận hành.",
    mucDo: "Trung bình",
    trangThai: "Đang xử lý",
  },
];

const VAT_TU_MAU = [
  { id: 1, ten: "Dầu bôi trơn turbine", donVi: "Lít", tonKho: 240, dinhMuc: 100 },
  { id: 2, ten: "Gioăng cao su van xả", donVi: "Cái", tonKho: 4, dinhMuc: 10 },
  { id: 3, ten: "Cầu chì hạ thế 100A", donVi: "Cái", tonKho: 25, dinhMuc: 15 },
  { id: 4, ten: "Mỡ bôi trơn vòng bi", donVi: "Kg", tonKho: 8, dinhMuc: 5 },
];

const HO_SO_MAU = [
  { id: 1, ten: "Lý lịch máy turbine H1", nhom: "thietbi", loai: "Lý lịch thiết bị", ngayCapNhat: "2026-06-01" },
  { id: 2, ten: "Biên bản nghiệm thu sửa chữa van xả 2025", nhom: "thietbi", loai: "Biên bản", ngayCapNhat: "2025-11-20" },
  { id: 3, ten: "Quy trình vận hành turbine H1", nhom: "thietbi", loai: "Quy trình", ngayCapNhat: "2026-01-10" },
  { id: 4, ten: "Phương án chữa cháy nhà máy chính", nhom: "phaply", phanLoai: "pccc_cnch", ngayCapNhat: "2026-02-15" },
  { id: 5, ten: "Giấy chứng nhận thẩm duyệt PCCC", nhom: "phaply", phanLoai: "pccc_cnch", ngayCapNhat: "2025-09-10" },
  { id: 6, ten: "Phương án cứu nạn cứu hộ", nhom: "phaply", phanLoai: "pccc_cnch", ngayCapNhat: "2026-02-15" },
  { id: 7, ten: "Báo cáo đánh giá tác động môi trường (ĐTM)", nhom: "phaply", phanLoai: "moitruong", ngayCapNhat: "2025-08-01" },
  { id: 8, ten: "Giấy phép xả thải", nhom: "phaply", phanLoai: "moitruong", ngayCapNhat: "2026-04-12" },
];

const NHOM_HO_SO = {
  thietbi: { ten: "Hồ sơ thiết bị" },
  phaply: { ten: "Hồ sơ pháp lý" },
};
const PHAN_LOAI_PHAP_LY = {
  pccc_cnch: "PCCC & CNCH",
  moitruong: "Môi trường",
};

const COT_CO_TO_MAY = [
  { key: "stator_1", label: "Cuộn dây Stator #1", unit: "°C", nhomCot: "Nhiệt độ cuộn dây Stator" },
  { key: "stator_2", label: "Cuộn dây Stator #2", unit: "°C", nhomCot: "Nhiệt độ cuộn dây Stator" },
  { key: "stator_3", label: "Cuộn dây Stator #3", unit: "°C", nhomCot: "Nhiệt độ cuộn dây Stator" },
  { key: "stator_4", label: "Cuộn dây Stator #4", unit: "°C", nhomCot: "Nhiệt độ cuộn dây Stator" },
  { key: "stator_5", label: "Cuộn dây Stator #5", unit: "°C", nhomCot: "Nhiệt độ cuộn dây Stator" },
  { key: "stator_6", label: "Cuộn dây Stator #6", unit: "°C", nhomCot: "Nhiệt độ cuộn dây Stator" },

  { key: "loi_1", label: "Lõi Stator #1", unit: "°C", nhomCot: "Nhiệt độ lõi Stator" },
  { key: "loi_2", label: "Lõi Stator #2", unit: "°C", nhomCot: "Nhiệt độ lõi Stator" },
  { key: "loi_3", label: "Lõi Stator #3", unit: "°C", nhomCot: "Nhiệt độ lõi Stator" },
  { key: "loi_4", label: "Lõi Stator #4", unit: "°C", nhomCot: "Nhiệt độ lõi Stator" },
  { key: "loi_5", label: "Lõi Stator #5", unit: "°C", nhomCot: "Nhiệt độ lõi Stator" },
  { key: "loi_6", label: "Lõi Stator #6", unit: "°C", nhomCot: "Nhiệt độ lõi Stator" },

  { key: "nd_gionong_1", label: "Gió nóng #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_gionong_2", label: "Gió nóng #2", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padohtb_1", label: "Pad OHTB #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padohtb_2", label: "Pad OHTB #2", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padoht_1", label: "Pad OHT #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_dauoht", label: "Dầu OHT", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padoht_2", label: "Pad OHT #2", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padodo_1", label: "Pad Ổ đỡ #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padodo_2", label: "Pad Ổ đỡ #2", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padodo_3", label: "Pad Ổ đỡ #3", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_giolanh_1", label: "Gió lạnh #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_giolanh_2", label: "Gió lạnh #2", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_giolanh_3", label: "Gió lạnh #3", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_dauohd", label: "Dầu OHD", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padohd_1", label: "Pad OHD #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padohd_2", label: "Pad OHD #2", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padoht_3", label: "Pad OHT #3", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_padohd_3", label: "Pad OHD #3", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_dauohtb_1", label: "Dầu OHTB #1", unit: "°C", nhomCot: "Nhiệt độ khác" },
  { key: "nd_dauohtb_2", label: "Dầu OHTB #2", unit: "°C", nhomCot: "Nhiệt độ khác" },

  { key: "nd2_padoht", label: "Pad OHT", unit: "°C", nhomCot: "Nhiệt độ (bảng 2)" },
  { key: "nd2_padohd", label: "Pad OHD", unit: "°C", nhomCot: "Nhiệt độ (bảng 2)" },
  { key: "nd2_giolanh", label: "Gió lạnh", unit: "°C", nhomCot: "Nhiệt độ (bảng 2)" },
  { key: "nd2_nuocra", label: "Nước ra", unit: "°C", nhomCot: "Nhiệt độ (bảng 2)" },
  { key: "nd2_padodo", label: "Pad Ổ đỡ", unit: "°C", nhomCot: "Nhiệt độ (bảng 2)" },

  { key: "rung_1", label: "Độ rung #1", unit: "", nhomCot: "Độ rung / Độ đảo" },
  { key: "rung_2", label: "Độ rung #2", unit: "", nhomCot: "Độ rung / Độ đảo" },
  { key: "dao_1", label: "Độ đảo #1", unit: "", nhomCot: "Độ rung / Độ đảo" },
  { key: "dao_2", label: "Độ đảo #2", unit: "", nhomCot: "Độ rung / Độ đảo" },

  { key: "tocdo", label: "Tốc độ", unit: "vòng/phút", nhomCot: "Vận hành" },
  { key: "tanso", label: "Tần số", unit: "Hz", nhomCot: "Vận hành" },
  { key: "phantram", label: "Phần trăm", unit: "%", nhomCot: "Vận hành" },

  { key: "mucdau_otren", label: "Ổ Trên", unit: "cm", nhomCot: "Mức dầu" },
  { key: "mucdau_otb", label: "Ổ TB", unit: "cm", nhomCot: "Mức dầu" },

  { key: "alnlm_dauvao", label: "Đầu vào", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_daura", label: "Đầu ra", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_giomf1", label: "Gió MF1", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_giomf2", label: "Gió MF2", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_giomf3", label: "Gió MF3", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_giomf4", label: "Gió MF4", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_otren", label: "Ổ trên", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_oduoi", label: "Ổ dưới", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },
  { key: "alnlm_otb", label: "Ổ TB", unit: "Mpa", nhomCot: "Áp lực nước làm mát" },

  { key: "aln_buongxoan", label: "Buồng xoắn", unit: "Mpa", nhomCot: "Áp lực nước" },
  { key: "aln_naptb", label: "Nắp TB", unit: "Mpa", nhomCot: "Áp lực nước" },
  { key: "aln_haluu", label: "Hạ lưu", unit: "Mpa", nhomCot: "Áp lực nước" },
  { key: "aln_truocbx", label: "Trước BX", unit: "Mpa", nhomCot: "Áp lực nước" },

  { key: "khichentruc", label: "Áp lực khí chèn trục", unit: "Mpa", nhomCot: "Khác" },
  { key: "tmt", label: "Tmt", unit: "°C", nhomCot: "Khác" },
];

const THONG_SO_CONFIGS = {
  duongday_tudung: {
    nhom: "Vận hành chung",
    ten: "Đường dây, MBA, Tự dùng AC-DC & Khí nén, Hồ tiêu",
    cols: [
      { key: "dd1_uab", label: "Uab", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_ubc", label: "Ubc", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_uac", label: "Uac", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_ia", label: "Ia", unit: "A", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_ib", label: "Ib", unit: "A", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_ic", label: "Ic", unit: "A", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_hz", label: "f", unit: "Hz", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_uc31", label: "Uc31", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_p", label: "P", unit: "MW", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },
      { key: "dd1_q", label: "Q", unit: "MVAr", nhomCot: "Đường dây Suối Sập 3 - Phú Yên" },

      { key: "dd2_uab", label: "Uab", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_ubc", label: "Ubc", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_uac", label: "Uac", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_ia", label: "Ia", unit: "A", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_ib", label: "Ib", unit: "A", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_ic", label: "Ic", unit: "A", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_hz", label: "f", unit: "Hz", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_uc32", label: "Uc32", unit: "kV", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_p", label: "P", unit: "MW", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },
      { key: "dd2_q", label: "Q", unit: "MVAr", nhomCot: "Đường dây Suối Sập 3 - Bắc Yên" },

      { key: "mba1ha_ua", label: "Ua", unit: "kV", nhomCot: "MBA T1" },
      { key: "mba1ha_ub", label: "Ub", unit: "kV", nhomCot: "MBA T1" },
      { key: "mba1ha_uc", label: "Uc", unit: "kV", nhomCot: "MBA T1" },
      { key: "mba1ha_ia", label: "Ia", unit: "A", nhomCot: "MBA T1" },
      { key: "mba1ha_ib", label: "Ib", unit: "A", nhomCot: "MBA T1" },
      { key: "mba1ha_ic", label: "Ic", unit: "A", nhomCot: "MBA T1" },
      { key: "mba1ha_hz", label: "f", unit: "Hz", nhomCot: "MBA T1" },
      { key: "mba1ha_t", label: "T", unit: "°C", nhomCot: "MBA T1" },

      { key: "mba2ha_ua", label: "Ua", unit: "kV", nhomCot: "MBA T2" },
      { key: "mba2ha_ub", label: "Ub", unit: "kV", nhomCot: "MBA T2" },
      { key: "mba2ha_uc", label: "Uc", unit: "kV", nhomCot: "MBA T2" },
      { key: "mba2ha_ia", label: "Ia", unit: "A", nhomCot: "MBA T2" },
      { key: "mba2ha_ib", label: "Ib", unit: "A", nhomCot: "MBA T2" },
      { key: "mba2ha_ic", label: "Ic", unit: "A", nhomCot: "MBA T2" },
      { key: "mba2ha_hz", label: "f", unit: "Hz", nhomCot: "MBA T2" },
      { key: "mba2ha_t", label: "T", unit: "°C", nhomCot: "MBA T2" },

      { key: "ac400_uab", label: "Uab", unit: "V", nhomCot: "Tự dùng 400Vac" },
      { key: "ac400_uac", label: "Uac", unit: "V", nhomCot: "Tự dùng 400Vac" },
      { key: "ac400_ubc", label: "Ubc", unit: "V", nhomCot: "Tự dùng 400Vac" },
      { key: "ac400_ia", label: "Ia", unit: "A", nhomCot: "Tự dùng 400Vac" },
      { key: "ac400_ib", label: "Ib", unit: "A", nhomCot: "Tự dùng 400Vac" },
      { key: "ac400_ic", label: "Ic", unit: "A", nhomCot: "Tự dùng 400Vac" },

      { key: "charger_uac1", label: "Uac1", unit: "V", nhomCot: "Tủ Charger" },
      { key: "charger_uac2", label: "Uac2", unit: "V", nhomCot: "Tủ Charger" },
      { key: "charger_udc", label: "Udc", unit: "V", nhomCot: "Tủ Charger" },
      { key: "charger_idc", label: "Idc", unit: "A", nhomCot: "Tủ Charger" },

      { key: "dc12_ubat", label: "Ubat", unit: "V", nhomCot: "Tủ DC 1&2" },
      { key: "dc12_ibat", label: "Ibat", unit: "A", nhomCot: "Tủ DC 1&2" },
      { key: "dc12_udc1", label: "Udc1", unit: "V", nhomCot: "Tủ DC 1&2" },
      { key: "dc12_udc2", label: "Udc2", unit: "V", nhomCot: "Tủ DC 1&2" },

      { key: "khinen_apluc", label: "Áp lực khí nén", unit: "MPa", nhomCot: "Khí nén" },
      { key: "hotieu_mucnuoc", label: "Mức nước hồ tiêu", unit: "m", nhomCot: "Hồ tiêu" },
      { key: "moitruong_t", label: "Nhiệt độ môi trường", unit: "°C", nhomCot: "Môi trường" },
    ],
  },
  coh1: {
    nhom: "Vận hành chung",
    ten: "Thông số cơ H1",
    cols: COT_CO_TO_MAY,
  },
  coh2: {
    nhom: "Vận hành chung",
    ten: "Thông số cơ H2",
    cols: COT_CO_TO_MAY,
  },
  dienh1h2: {
    nhom: "Vận hành chung",
    ten: "Thông số điện tổ máy H1 & H2",
    cols: [
      { key: "h1_uab", label: "Uab", unit: "V", nhomCot: "Tổ máy H1" },
      { key: "h1_ubc", label: "Ubc", unit: "V", nhomCot: "Tổ máy H1" },
      { key: "h1_uac", label: "Uac", unit: "V", nhomCot: "Tổ máy H1" },
      { key: "h1_ia", label: "Ia", unit: "A", nhomCot: "Tổ máy H1" },
      { key: "h1_ib", label: "Ib", unit: "A", nhomCot: "Tổ máy H1" },
      { key: "h1_ic", label: "Ic", unit: "A", nhomCot: "Tổ máy H1" },
      { key: "h1_f", label: "f", unit: "Hz", nhomCot: "Tổ máy H1" },
      { key: "h1_p", label: "P", unit: "MW", nhomCot: "Tổ máy H1" },
      { key: "h1_q", label: "Q", unit: "MVAr", nhomCot: "Tổ máy H1" },
      { key: "h1_cosj", label: "Cos φ", unit: "", nhomCot: "Tổ máy H1" },

      { key: "h1_uf", label: "Uf", unit: "V", nhomCot: "Kích từ H1" },
      { key: "h1_if", label: "If", unit: "A", nhomCot: "Kích từ H1" },
      { key: "h1_ug", label: "UG", unit: "kV", nhomCot: "Kích từ H1" },

      { key: "h1_chedo_dt", label: "Chế độ", unit: "", nhomCot: "Điều tốc H1" },
      { key: "h1_domo", label: "Độ mở", unit: "%", nhomCot: "Điều tốc H1" },
      { key: "h1_fg", label: "Tần số fG", unit: "Hz", nhomCot: "Điều tốc H1" },
      { key: "h1_fs", label: "Tần số fS", unit: "Hz", nhomCot: "Điều tốc H1" },

      { key: "h1_chedo_vc", label: "Chế độ", unit: "", nhomCot: "Van chính H1" },
      { key: "h1_apbinh", label: "Áp lực Bình", unit: "Mpa", nhomCot: "Van chính H1" },
      { key: "h1_apservo", label: "Áp lực Servo", unit: "Mpa", nhomCot: "Van chính H1" },
      { key: "h1_mucdaubinh", label: "Mức dầu Bình", unit: "mm", nhomCot: "Van chính H1" },
      { key: "h1_mucdauservo", label: "Mức dầu Servo", unit: "mm", nhomCot: "Van chính H1" },
      { key: "h1_apbinhnang", label: "Áp lực Bình nâng", unit: "Mpa", nhomCot: "Van chính H1" },
      { key: "h1_apnang", label: "Áp lực Nâng", unit: "Mpa", nhomCot: "Van chính H1" },

      { key: "h2_uab", label: "Uab", unit: "V", nhomCot: "Tổ máy H2" },
      { key: "h2_ubc", label: "Ubc", unit: "V", nhomCot: "Tổ máy H2" },
      { key: "h2_uac", label: "Uac", unit: "V", nhomCot: "Tổ máy H2" },
      { key: "h2_ia", label: "Ia", unit: "A", nhomCot: "Tổ máy H2" },
      { key: "h2_ib", label: "Ib", unit: "A", nhomCot: "Tổ máy H2" },
      { key: "h2_ic", label: "Ic", unit: "A", nhomCot: "Tổ máy H2" },
      { key: "h2_f", label: "f", unit: "Hz", nhomCot: "Tổ máy H2" },
      { key: "h2_p", label: "P", unit: "MW", nhomCot: "Tổ máy H2" },
      { key: "h2_q", label: "Q", unit: "MVAr", nhomCot: "Tổ máy H2" },
      { key: "h2_cosj", label: "Cos φ", unit: "", nhomCot: "Tổ máy H2" },

      { key: "h2_uf", label: "Uf", unit: "V", nhomCot: "Kích từ H2" },
      { key: "h2_if", label: "If", unit: "A", nhomCot: "Kích từ H2" },
      { key: "h2_ug", label: "UG", unit: "kV", nhomCot: "Kích từ H2" },

      { key: "h2_chedo_dt", label: "Chế độ", unit: "", nhomCot: "Điều tốc H2" },
      { key: "h2_domo", label: "Độ mở", unit: "%", nhomCot: "Điều tốc H2" },
      { key: "h2_fg", label: "Tần số fG", unit: "Hz", nhomCot: "Điều tốc H2" },
      { key: "h2_fs", label: "Tần số fS", unit: "Hz", nhomCot: "Điều tốc H2" },

      { key: "h2_chedo_vc", label: "Chế độ", unit: "", nhomCot: "Van chính H2" },
      { key: "h2_apbinh", label: "Áp lực Bình", unit: "Mpa", nhomCot: "Van chính H2" },
      { key: "h2_apservo", label: "Áp lực Servo", unit: "Mpa", nhomCot: "Van chính H2" },
      { key: "h2_mucdaubinh", label: "Mức dầu Bình", unit: "mm", nhomCot: "Van chính H2" },
      { key: "h2_mucdauservo", label: "Mức dầu Servo", unit: "mm", nhomCot: "Van chính H2" },
      { key: "h2_apbinhnang", label: "Áp lực Bình nâng", unit: "Mpa", nhomCot: "Van chính H2" },
      { key: "h2_apnang", label: "Áp lực Nâng", unit: "Mpa", nhomCot: "Van chính H2" },
    ],
  },
};

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function taoDongRong(cols) {
  const values = {};
  cols.forEach((c) => (values[c.key] = ""));
  return values;
}

function taoDay24Gio(cols) {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const dateStr = today.toISOString().slice(0, 10);
  const rows = [];
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, "0");
    rows.push({
      id: Date.now() + Math.random() + h,
      thoiGian: `${dateStr}T${hh}:00`,
      values: taoDongRong(cols),
    });
  }
  return rows;
}

const THONG_SO_MAU = Object.fromEntries(
  Object.keys(THONG_SO_CONFIGS).map((k) => [
    k,
    [{ id: Date.now() + Math.random(), thoiGian: nowLocal(), values: taoDongRong(THONG_SO_CONFIGS[k].cols) }],
  ])
);

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}
function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
const THU = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default function QuanLyNhaMay() {
  const [tab, setTab] = useState("lich");
  const [tuanGoc, setTuanGoc] = useState(() => startOfWeek(new Date()));
  const [nhanVien, setNhanVien] = useState(NHAN_VIEN_MAU);
  const [phanCa, setPhanCa] = useState({}); // key: `${dateStr}|${ca}` -> [{nvId, viTri}]
  const [thietBi, setThietBi] = useState(THIET_BI_MAU);
  const [suCo, setSuCo] = useState(SU_CO_MAU);
  const [vatTu, setVatTu] = useState(VAT_TU_MAU);
  const [hoSo, setHoSo] = useState(HO_SO_MAU);
  const [timHoSo, setTimHoSo] = useState("");
  const [nhomHoSo, setNhomHoSo] = useState("thietbi"); // thietbi | pccc_cnch | moitruong
  const [configThongSo, setConfigThongSo] = useState(THONG_SO_CONFIGS);
  const [thongSo, setThongSo] = useState(THONG_SO_MAU);
  const [bangThongSoChon, setBangThongSoChon] = useState("duongday_tudung");
  const [showThemBang, setShowThemBang] = useState(false);
  const [timVatTu, setTimVatTu] = useState("");
  const [nguongCanhBao, setNguongCanhBao] = useState({});
  const [showNguongModal, setShowNguongModal] = useState(false);
  const [banGiao, setBanGiao] = useState([
    {
      id: 1,
      ngay: toDateStr(new Date()),
      ca: CA_LIST[0],
      nguoiGiao: "Nguyễn Văn Hải",
      thongSo: "Mực nước hồ: 590.2m | Công suất phát: 12.4 MW",
      suCo: "Không có",
      ghiChu: "Đã kiểm tra van xả đáy, hoạt động bình thường.",
    },
  ]);
  const [modal, setModal] = useState(null); // {dateStr, ca}
  const [showThemNV, setShowThemNV] = useState(false);
  const [daTaiXong, setDaTaiXong] = useState(false);

  async function taiAnToan(key) {
    try {
      const r = await storageGet(key);
      return r ? JSON.parse(r.value) : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let conKetNoi = true;
    (async () => {
      const [nv, pc, bg, tb, sc, vt, hs, tsData, tsConfig, ng] = await Promise.all([
        taiAnToan("nhanvien"),
        taiAnToan("phanca"),
        taiAnToan("bangiao"),
        taiAnToan("thietbi"),
        taiAnToan("suco"),
        taiAnToan("vattu"),
        taiAnToan("hoso"),
        taiAnToan("thongso-data"),
        taiAnToan("thongso-config"),
        taiAnToan("nguong-canh-bao"),
      ]);
      if (!conKetNoi) return;
      if (nv) setNhanVien(nv);
      if (pc) setPhanCa(pc);
      if (bg) setBanGiao(bg);
      if (tb) setThietBi(tb);
      if (sc) setSuCo(sc);
      if (vt) setVatTu(vt);
      if (hs) setHoSo(hs);
      if (tsData) setThongSo(tsData);
      if (tsConfig) setConfigThongSo(tsConfig);
      if (ng) setNguongCanhBao(ng);
      setDaTaiXong(true);
    })();
    return () => {
      conKetNoi = false;
    };
  }, []);

  useEffect(() => {
    if (daTaiXong) storageSet("nhanvien", JSON.stringify(nhanVien)).catch(() => {});
  }, [nhanVien, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("phanca", JSON.stringify(phanCa)).catch(() => {});
  }, [phanCa, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("bangiao", JSON.stringify(banGiao)).catch(() => {});
  }, [banGiao, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("thietbi", JSON.stringify(thietBi)).catch(() => {});
  }, [thietBi, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("suco", JSON.stringify(suCo)).catch(() => {});
  }, [suCo, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("vattu", JSON.stringify(vatTu)).catch(() => {});
  }, [vatTu, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("hoso", JSON.stringify(hoSo)).catch(() => {});
  }, [hoSo, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("thongso-data", JSON.stringify(thongSo)).catch(() => {});
  }, [thongSo, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("thongso-config", JSON.stringify(configThongSo)).catch(() => {});
  }, [configThongSo, daTaiXong]);
  useEffect(() => {
    if (daTaiXong) storageSet("nguong-canh-bao", JSON.stringify(nguongCanhBao)).catch(() => {});
  }, [nguongCanhBao, daTaiXong]);


  const ngayTrongTuan = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(tuanGoc);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [tuanGoc]);

  function key(dateStr, ca) {
    return `${dateStr}|${ca}`;
  }

  function themPhanCa(dateStr, ca, nvId, viTri) {
    const k = key(dateStr, ca);
    setPhanCa((prev) => {
      const list = prev[k] || [];
      if (list.some((x) => x.nvId === nvId)) return prev;
      return { ...prev, [k]: [...list, { nvId, viTri }] };
    });
  }

  function xoaPhanCa(dateStr, ca, nvId) {
    const k = key(dateStr, ca);
    setPhanCa((prev) => ({
      ...prev,
      [k]: (prev[k] || []).filter((x) => x.nvId !== nvId),
    }));
  }

  function tenNV(id) {
    return nhanVien.find((n) => n.id === id)?.ten || "?";
  }

  function congThemMotGio(thoiGianStr) {
    const d = new Date(thoiGianStr);
    d.setHours(d.getHours() + 1);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function taoDongTrong(cols, thoiGian) {
    const values = {};
    cols.forEach((c) => (values[c.key] = ""));
    return { id: Date.now() + Math.random(), thoiGian: thoiGian || nowLocal(), values };
  }

  function themDongThongSo(configKey) {
    const cols = configThongSo[configKey].cols;
    setThongSo((prev) => {
      const dongGanNhat = (prev[configKey] || [])[0];
      const thoiGianMoi = dongGanNhat ? congThemMotGio(dongGanNhat.thoiGian) : nowLocal();
      return { ...prev, [configKey]: [taoDongTrong(cols, thoiGianMoi), ...(prev[configKey] || [])] };
    });
  }
  function suaGiaTriThongSo(configKey, rowId, colKey, val) {
    setThongSo((prev) => ({
      ...prev,
      [configKey]: prev[configKey].map((r) =>
        r.id === rowId ? { ...r, values: { ...r.values, [colKey]: val } } : r
      ),
    }));
  }
  function suaThoiGianThongSo(configKey, rowId, val) {
    setThongSo((prev) => ({
      ...prev,
      [configKey]: prev[configKey].map((r) => (r.id === rowId ? { ...r, thoiGian: val } : r)),
    }));
  }
  function xoaDongThongSo(configKey, rowId) {
    setThongSo((prev) => ({ ...prev, [configKey]: prev[configKey].filter((r) => r.id !== rowId) }));
  }

  function taoBangMoi({ ten, nhom, cols }) {
    const key = "custom_" + Date.now();
    setConfigThongSo((prev) => ({ ...prev, [key]: { ten, nhom, cols } }));
    setThongSo((prev) => ({ ...prev, [key]: [taoDongTrong(cols)] }));
    setBangThongSoChon(key);
  }

  function layNguong(configKey, colKey) {
    return (nguongCanhBao[configKey] && nguongCanhBao[configKey][colKey]) || {};
  }
  function suaNguong(configKey, colKey, field, val) {
    setNguongCanhBao((prev) => {
      const cur = prev[configKey] || {};
      const colCur = cur[colKey] || {};
      return {
        ...prev,
        [configKey]: { ...cur, [colKey]: { ...colCur, [field]: val === "" ? null : Number(val) } },
      };
    });
  }
  function vuotNguong(configKey, colKey, value) {
    const n = layNguong(configKey, colKey);
    const v = parseFloat(value);
    if (isNaN(v)) return false;
    if (n.min != null && v < n.min) return true;
    if (n.max != null && v > n.max) return true;
    return false;
  }

  function xuatExcel(configKey) {
    const cfg = configThongSo[configKey];
    const rows = thongSo[configKey] || [];
    const header = ["Thời điểm ghi", ...cfg.cols.map((c) => c.label + (c.unit ? ` (${c.unit})` : ""))];
    const nhomRow = ["", ...cfg.cols.map((c) => c.nhomCot || "")];
    const data = rows.map((r) => [r.thoiGian, ...cfg.cols.map((c) => r.values[c.key])]);
    const ws = XLSX.utils.aoa_to_sheet([[cfg.ten], nhomRow, header, ...data]);
    const wb = XLSX.utils.book_new();
    const tenSheet = cfg.ten.replace(/[\/\\?*\[\]:]/g, "").slice(0, 31) || "Sheet1";
    XLSX.utils.book_append_sheet(wb, ws, tenSheet);
    const tenFile = cfg.ten.replace(/[\/\\?*\[\]:"<>|]/g, "").slice(0, 60);
    XLSX.writeFile(wb, `${tenFile}_${toDateStr(new Date())}.xlsx`);
  }

  if (!daTaiXong) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-blue-600 font-semibold mb-2">
            Thủy điện Suối Sập 3
          </div>
          <div className="text-slate-500 text-sm animate-pulse">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-blue-600 font-semibold">
              Thủy điện Suối Sập 3
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">
              Quản lý ca trực
            </h1>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
            {[
              { id: "lich", label: "Ca trực", icon: ClipboardList },
              { id: "nhanvien", label: "Nhân viên", icon: Users },
              { id: "bangiao", label: "Bàn giao ca", icon: ArrowRightLeft },
              { id: "thietbi", label: "Thiết bị & Sự cố", icon: Wrench },
              { id: "thongso", label: "Thông số thiết bị", icon: Activity },
              { id: "vattu", label: "Vật tư & Kho", icon: Package },
              { id: "hoso", label: "Hồ sơ", icon: FolderOpen },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        {tab === "lich" && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = new Date(tuanGoc);
                    d.setDate(d.getDate() - 7);
                    setTuanGoc(d);
                  }}
                  className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-600 font-mono">
                  {toDateStr(ngayTrongTuan[0])} → {toDateStr(ngayTrongTuan[6])}
                </span>
                <button
                  onClick={() => {
                    const d = new Date(tuanGoc);
                    d.setDate(d.getDate() + 7);
                    setTuanGoc(d);
                  }}
                  className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                onClick={() => setTuanGoc(startOfWeek(new Date()))}
                className="text-xs px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
              >
                Tuần hiện tại
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="text-left p-3 text-slate-500 font-medium w-40 border-b border-slate-200">
                      Ca / Ngày
                    </th>
                    {ngayTrongTuan.map((d, i) => (
                      <th key={i} className="p-3 text-left border-b border-slate-200 border-l border-slate-200">
                        <div className="text-slate-500 font-normal text-xs">{THU[i]}</div>
                        <div className="text-slate-900 font-semibold">
                          {d.getDate().toString().padStart(2, "0")}/{(d.getMonth() + 1).toString().padStart(2, "0")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CA_LIST.map((ca) => (
                    <tr key={ca} className="border-b border-slate-200 last:border-0">
                      <td className="p-3 text-slate-600 font-medium bg-blue-50/50 align-top">{ca}</td>
                      {ngayTrongTuan.map((d, i) => {
                        const dateStr = toDateStr(d);
                        const list = phanCa[key(dateStr, ca)] || [];
                        return (
                          <td
                            key={i}
                            className="p-2 align-top border-l border-slate-200 hover:bg-blue-50/50 transition cursor-pointer"
                            onClick={() => setModal({ dateStr, ca })}
                          >
                            <div className="flex flex-col gap-1 min-h-[44px]">
                              {list.length === 0 && (
                                <span className="text-slate-500 text-xs italic">Chưa phân ca</span>
                              )}
                              {list.map((x) => (
                                <span
                                  key={x.nvId}
                                  className="text-xs bg-slate-100 rounded px-2 py-1 text-slate-700"
                                >
                                  {tenNV(x.nvId)}{" "}
                                  <span className="text-blue-600">· {x.viTri}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">Bấm vào một ô để phân công nhân viên trực.</p>
          </section>
        )}

        {tab === "nhanvien" && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
              <button
                onClick={() => setShowThemNV(true)}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition"
              >
                <Plus size={15} /> Thêm nhân viên
              </button>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50 text-slate-500 text-left">
                    <th className="p-3 font-medium">Họ tên</th>
                    <th className="p-3 font-medium">Chức vụ</th>
                    <th className="p-3 font-medium">Tổ vận hành</th>
                    <th className="p-3 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {nhanVien.map((nv) => (
                    <tr key={nv.id} className="border-t border-slate-200">
                      <td className="p-3 font-medium">{nv.ten}</td>
                      <td className="p-3 text-slate-600">{nv.chucVu}</td>
                      <td className="p-3 text-slate-600">{nv.to}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setNhanVien((prev) => prev.filter((x) => x.id !== nv.id))}
                          className="text-slate-400 hover:text-red-600 transition"
                        >
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "bangiao" && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Sổ bàn giao ca</h2>
              <button
                onClick={() =>
                  setBanGiao((prev) => [
                    {
                      id: Date.now(),
                      ngay: toDateStr(new Date()),
                      ca: CA_LIST[0],
                      nguoiGiao: "",
                      thongSo: "",
                      suCo: "",
                      ghiChu: "",
                    },
                    ...prev,
                  ])
                }
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition"
              >
                <Plus size={15} /> Tạo biên bản mới
              </button>
            </div>

            <div className="space-y-4">
              {banGiao.map((b) => (
                <div key={b.id} className="rounded-lg border border-slate-200 bg-blue-50/50 p-4">
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <label className="text-xs text-slate-500 flex flex-col gap-1">
                      Ngày
                      <input
                        type="date"
                        value={b.ngay}
                        onChange={(e) =>
                          setBanGiao((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, ngay: e.target.value } : x))
                          )
                        }
                        className="bg-slate-100 rounded px-2 py-1.5 text-slate-900 text-sm border border-slate-300"
                      />
                    </label>
                    <label className="text-xs text-slate-500 flex flex-col gap-1">
                      Ca trực
                      <select
                        value={b.ca}
                        onChange={(e) =>
                          setBanGiao((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, ca: e.target.value } : x))
                          )
                        }
                        className="bg-slate-100 rounded px-2 py-1.5 text-slate-900 text-sm border border-slate-300"
                      >
                        {CA_LIST.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-slate-500 flex flex-col gap-1">
                      Người giao ca
                      <input
                        value={b.nguoiGiao}
                        onChange={(e) =>
                          setBanGiao((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, nguoiGiao: e.target.value } : x))
                          )
                        }
                        placeholder="Họ tên"
                        className="bg-slate-100 rounded px-2 py-1.5 text-slate-900 text-sm border border-slate-300"
                      />
                    </label>
                  </div>
                  <label className="text-xs text-slate-500 flex flex-col gap-1 mb-3">
                    Thông số vận hành
                    <input
                      value={b.thongSo}
                      onChange={(e) =>
                        setBanGiao((prev) =>
                          prev.map((x) => (x.id === b.id ? { ...x, thongSo: e.target.value } : x))
                        )
                      }
                      placeholder="VD: Mực nước hồ, công suất phát..."
                      className="bg-slate-100 rounded px-2 py-1.5 text-slate-900 text-sm border border-slate-300"
                    />
                  </label>
                  <label className="text-xs text-slate-500 flex flex-col gap-1 mb-3">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={12} className="text-blue-600" /> Sự cố / bất thường
                    </span>
                    <input
                      value={b.suCo}
                      onChange={(e) =>
                        setBanGiao((prev) =>
                          prev.map((x) => (x.id === b.id ? { ...x, suCo: e.target.value } : x))
                        )
                      }
                      placeholder="Không có / mô tả sự cố"
                      className="bg-slate-100 rounded px-2 py-1.5 text-slate-900 text-sm border border-slate-300"
                    />
                  </label>
                  <label className="text-xs text-slate-500 flex flex-col gap-1">
                    Ghi chú bàn giao
                    <textarea
                      value={b.ghiChu}
                      onChange={(e) =>
                        setBanGiao((prev) =>
                          prev.map((x) => (x.id === b.id ? { ...x, ghiChu: e.target.value } : x))
                        )
                      }
                      rows={2}
                      className="bg-slate-100 rounded px-2 py-1.5 text-slate-900 text-sm border border-slate-300 resize-none"
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}
        {tab === "thietbi" && (
          <section className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Danh sách thiết bị</h2>
                <button
                  onClick={() =>
                    setThietBi((prev) => [
                      ...prev,
                      { id: Date.now(), ma: "", ten: "Thiết bị mới", khuVuc: "", trangThai: "Hoạt động", lanBaoTriCuoi: toDateStr(new Date()), phuTrach: "" },
                    ])
                  }
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition"
                >
                  <Plus size={15} /> Thêm thiết bị
                </button>
              </div>
              <div className="rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[820px]">
                  <thead>
                    <tr className="bg-blue-50 text-slate-500 text-left">
                      <th className="p-3 font-medium">Mã TB</th>
                      <th className="p-3 font-medium">Tên thiết bị</th>
                      <th className="p-3 font-medium">Khu vực</th>
                      <th className="p-3 font-medium">Người phụ trách</th>
                      <th className="p-3 font-medium">Trạng thái</th>
                      <th className="p-3 font-medium">Bảo trì gần nhất</th>
                      <th className="p-3 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {thietBi.map((tb) => (
                      <tr key={tb.id} className="border-t border-slate-200">
                        <td className="p-3">
                          <input
                            value={tb.ma}
                            onChange={(e) => setThietBi((prev) => prev.map((x) => (x.id === tb.id ? { ...x, ma: e.target.value } : x)))}
                            placeholder="TB-00X"
                            className="w-20 bg-transparent font-mono text-xs text-blue-600 border-b border-transparent focus:border-blue-400 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 font-medium">
                          <input
                            value={tb.ten}
                            onChange={(e) => setThietBi((prev) => prev.map((x) => (x.id === tb.id ? { ...x, ten: e.target.value } : x)))}
                            className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-slate-600">
                          <input
                            value={tb.khuVuc}
                            onChange={(e) => setThietBi((prev) => prev.map((x) => (x.id === tb.id ? { ...x, khuVuc: e.target.value } : x)))}
                            className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-slate-600">
                          <input
                            value={tb.phuTrach}
                            onChange={(e) => setThietBi((prev) => prev.map((x) => (x.id === tb.id ? { ...x, phuTrach: e.target.value } : x)))}
                            placeholder="Chưa gán"
                            className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={tb.trangThai}
                            onChange={(e) => setThietBi((prev) => prev.map((x) => (x.id === tb.id ? { ...x, trangThai: e.target.value } : x)))}
                            className={`text-xs px-2 py-1 rounded-full font-medium bg-transparent border-0 focus:outline-none ${
                              tb.trangThai === "Hoạt động"
                                ? "text-emerald-600"
                                : "text-orange-500"
                            }`}
                          >
                            <option className="bg-slate-100 text-slate-900">Hoạt động</option>
                            <option className="bg-slate-100 text-slate-900">Cần kiểm tra</option>
                            <option className="bg-slate-100 text-slate-900">Ngừng hoạt động</option>
                          </select>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-xs">{tb.lanBaoTriCuoi}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setThietBi((prev) => prev.filter((x) => x.id !== tb.id))}
                            className="text-slate-400 hover:text-red-600 transition"
                          >
                            <X size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Nhật ký sự cố</h2>
                <button
                  onClick={() =>
                    setSuCo((prev) => [
                      {
                        id: Date.now(),
                        ngay: toDateStr(new Date()),
                        thietBi: "",
                        moTa: "",
                        mucDo: "Trung bình",
                        trangThai: "Đang xử lý",
                      },
                      ...prev,
                    ])
                  }
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition"
                >
                  <Plus size={15} /> Ghi nhận sự cố
                </button>
              </div>
              <div className="space-y-3">
                {suCo.map((sc) => (
                  <div key={sc.id} className="rounded-lg border border-slate-200 bg-blue-50/50 p-4">
                    <div className="grid sm:grid-cols-4 gap-3 mb-3">
                      <input
                        type="date"
                        value={sc.ngay}
                        onChange={(e) => setSuCo((prev) => prev.map((x) => (x.id === sc.id ? { ...x, ngay: e.target.value } : x)))}
                        className="bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300"
                      />
                      <input
                        value={sc.thietBi}
                        onChange={(e) => setSuCo((prev) => prev.map((x) => (x.id === sc.id ? { ...x, thietBi: e.target.value } : x)))}
                        placeholder="Thiết bị liên quan"
                        className="bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300"
                      />
                      <select
                        value={sc.mucDo}
                        onChange={(e) => setSuCo((prev) => prev.map((x) => (x.id === sc.id ? { ...x, mucDo: e.target.value } : x)))}
                        className="bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300"
                      >
                        <option>Nhẹ</option>
                        <option>Trung bình</option>
                        <option>Nghiêm trọng</option>
                      </select>
                      <select
                        value={sc.trangThai}
                        onChange={(e) => setSuCo((prev) => prev.map((x) => (x.id === sc.id ? { ...x, trangThai: e.target.value } : x)))}
                        className="bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300"
                      >
                        <option>Đang xử lý</option>
                        <option>Đã khắc phục</option>
                        <option>Chờ vật tư</option>
                      </select>
                    </div>
                    <textarea
                      value={sc.moTa}
                      onChange={(e) => setSuCo((prev) => prev.map((x) => (x.id === sc.id ? { ...x, moTa: e.target.value } : x)))}
                      placeholder="Mô tả sự cố..."
                      rows={2}
                      className="w-full bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "thongso" && (
          <section>
            <div className="grid sm:grid-cols-[220px_1fr] gap-5">
              {/* Menu chọn bảng */}
              <div className="rounded-lg border border-slate-200 bg-blue-50/50 p-2 h-fit">
                {[...new Set(Object.values(configThongSo).map((c) => c.nhom))].map((nhomTen) => (
                  <div key={nhomTen}>
                    <div className="mt-3 first:mt-0 px-3 py-1 text-xs uppercase tracking-wide text-slate-400 font-medium">
                      {nhomTen}
                    </div>
                    {Object.entries(configThongSo)
                      .filter(([, cfg]) => cfg.nhom === nhomTen)
                      .map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setBangThongSoChon(key)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                            bangThongSoChon === key
                              ? "bg-blue-600 text-white font-medium"
                              : "hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          {cfg.ten}
                        </button>
                      ))}
                  </div>
                ))}
                <button
                  onClick={() => setShowThemBang(true)}
                  className="w-full flex items-center gap-1.5 mt-4 px-3 py-2 rounded-md text-sm text-blue-600 border border-dashed border-blue-500/40 hover:bg-blue-500/10 transition"
                >
                  <Plus size={15} /> Thêm bảng mới
                </button>
              </div>

              {/* Bảng thông số đang chọn */}
              <div>
                <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold">{configThongSo[bangThongSoChon].ten}</h2>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowNguongModal(true)}
                      className="flex items-center gap-1.5 border border-slate-300 text-slate-600 text-sm font-medium px-3 py-2 rounded-md hover:bg-slate-100 transition"
                    >
                      <AlertTriangle size={15} /> Ngưỡng cảnh báo
                    </button>
                    <button
                      onClick={() => xuatExcel(bangThongSoChon)}
                      className="flex items-center gap-1.5 border border-slate-300 text-slate-600 text-sm font-medium px-3 py-2 rounded-md hover:bg-slate-100 transition"
                    >
                      <FolderOpen size={15} /> Xuất Excel
                    </button>
                    <button
                      onClick={() => themDongThongSo(bangThongSoChon)}
                      className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition"
                    >
                      <Plus size={15} /> Thêm bản ghi
                    </button>
                  </div>
                </div>

                {(() => {
                  const cfg = configThongSo[bangThongSoChon];
                  const rows = thongSo[bangThongSoChon] || [];
                  let soVuot = 0;
                  rows.forEach((row) =>
                    cfg.cols.forEach((c) => {
                      if (vuotNguong(bangThongSoChon, c.key, row.values[c.key])) soVuot += 1;
                    })
                  );
                  return soVuot > 0 ? (
                    <div className="mb-3 flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-600 text-sm rounded-md px-3 py-2">
                      <AlertTriangle size={15} />
                      Có {soVuot} giá trị đang vượt ngưỡng cảnh báo trong bảng này.
                    </div>
                  ) : null;
                })()}

                <div className="rounded-lg border border-slate-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      {configThongSo[bangThongSoChon].cols.some((c) => c.nhomCot) && (
                        <tr className="bg-white/90">
                          <th className="p-2 border-b border-slate-200"></th>
                          {(() => {
                            const cols = configThongSo[bangThongSoChon].cols;
                            const groups = [];
                            cols.forEach((c) => {
                              const last = groups[groups.length - 1];
                              if (last && last.label === (c.nhomCot || "")) {
                                last.span += 1;
                              } else {
                                groups.push({ label: c.nhomCot || "", span: 1 });
                              }
                            });
                            return groups.map((g, i) => (
                              <th
                                key={i}
                                colSpan={g.span}
                                className="p-2 text-center text-xs uppercase tracking-wide text-blue-600 border-b border-l border-slate-200 whitespace-nowrap"
                              >
                                {g.label}
                              </th>
                            ));
                          })()}
                          <th className="p-2 border-b border-slate-200"></th>
                        </tr>
                      )}
                      <tr className="bg-blue-50 text-slate-500 text-left">
                        <th className="p-3 font-medium whitespace-nowrap">Thời điểm ghi</th>
                        {configThongSo[bangThongSoChon].cols.map((c) => (
                          <th key={c.key} className="p-3 font-medium whitespace-nowrap border-l border-slate-200">
                            {c.label} {c.unit && <span className="text-slate-400">({c.unit})</span>}
                          </th>
                        ))}
                        <th className="p-3 font-medium w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(thongSo[bangThongSoChon] || []).map((row) => (
                        <tr key={row.id} className="border-t border-slate-200">
                          <td className="p-3">
                            <input
                              type="datetime-local"
                              value={row.thoiGian}
                              onChange={(e) => suaThoiGianThongSo(bangThongSoChon, row.id, e.target.value)}
                              className="bg-slate-100 rounded px-2 py-1 text-xs border border-slate-300 font-mono"
                            />
                          </td>
                          {configThongSo[bangThongSoChon].cols.map((c) => {
                            const vuot = vuotNguong(bangThongSoChon, c.key, row.values[c.key]);
                            return (
                              <td key={c.key} className="p-2">
                                <input
                                  value={row.values[c.key]}
                                  onChange={(e) => suaGiaTriThongSo(bangThongSoChon, row.id, c.key, e.target.value)}
                                  placeholder="—"
                                  className={`w-24 rounded px-2 py-1.5 text-sm border focus:outline-none ${
                                    vuot
                                      ? "bg-red-500/15 border-red-500 text-red-600 font-semibold"
                                      : "bg-slate-100 border-transparent focus:border-blue-400 focus:bg-slate-100"
                                  }`}
                                />
                              </td>
                            );
                          })}
                          <td className="p-3">
                            <button
                              onClick={() => xoaDongThongSo(bangThongSoChon, row.id)}
                              className="text-slate-400 hover:text-red-600 transition"
                            >
                              <X size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Mỗi dòng là một lần ghi số liệu (thường theo ca trực). Bấm "Thêm bản ghi" để ghi lần đo mới.
                </p>
              </div>
            </div>
          </section>
        )}

        {tab === "vattu" && (
          <section>
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold">Vật tư & Kho</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={timVatTu}
                    onChange={(e) => setTimVatTu(e.target.value)}
                    placeholder="Tìm thiết bị / vật tư..."
                    className="bg-slate-100 rounded-md pl-8 pr-3 py-2 text-sm border border-slate-300"
                  />
                </div>
                <button
                  onClick={() =>
                    setVatTu((prev) => [...prev, { id: Date.now(), ten: "Vật tư mới", donVi: "Cái", tonKho: 0, dinhMuc: 0 }])
                  }
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition whitespace-nowrap"
                >
                  <Plus size={15} /> Thêm vật tư
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-blue-50 text-slate-500 text-left">
                    <th className="p-3 font-medium">Tên vật tư</th>
                    <th className="p-3 font-medium">Đơn vị</th>
                    <th className="p-3 font-medium">Tồn kho</th>
                    <th className="p-3 font-medium">Định mức tối thiểu</th>
                    <th className="p-3 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {vatTu
                    .filter((vt) => vt.ten.toLowerCase().includes(timVatTu.toLowerCase()))
                    .map((vt) => {
                    const thieu = vt.tonKho < vt.dinhMuc;
                    return (
                      <tr key={vt.id} className="border-t border-slate-200">
                        <td className="p-3 font-medium">{vt.ten}</td>
                        <td className="p-3 text-slate-600">{vt.donVi}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={vt.tonKho}
                            onChange={(e) =>
                              setVatTu((prev) =>
                                prev.map((x) => (x.id === vt.id ? { ...x, tonKho: Number(e.target.value) } : x))
                              )
                            }
                            className={`w-20 bg-slate-100 rounded px-2 py-1 text-sm border ${
                              thieu ? "border-red-500/60 text-red-600" : "border-slate-300"
                            }`}
                          />
                        </td>
                        <td className="p-3 text-slate-600">{vt.dinhMuc}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setVatTu((prev) => prev.filter((x) => x.id !== vt.id))}
                            className="text-slate-400 hover:text-red-600 transition"
                          >
                            <X size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {vatTu.filter((vt) => vt.ten.toLowerCase().includes(timVatTu.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 text-sm italic">
                        Không tìm thấy vật tư phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {vatTu.some((vt) => vt.tonKho < vt.dinhMuc) && (
              <p className="text-xs text-blue-600 mt-3 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Có vật tư dưới định mức tối thiểu — cần đề xuất mua bổ sung.
              </p>
            )}
          </section>
        )}

        {tab === "hoso" && (
          <section>
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold">Hồ sơ kỹ thuật</h2>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={timHoSo}
                  onChange={(e) => setTimHoSo(e.target.value)}
                  placeholder="Tìm hồ sơ..."
                  className="bg-slate-100 rounded-md pl-8 pr-3 py-2 text-sm border border-slate-300"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-[220px_1fr] gap-5">
              {/* Cây thư mục */}
              <div className="rounded-lg border border-slate-200 bg-blue-50/50 p-2 h-fit">
                <button
                  onClick={() => setNhomHoSo("thietbi")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                    nhomHoSo === "thietbi" ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Hồ sơ thiết bị
                </button>
                <div className="mt-2 px-3 py-1 text-xs uppercase tracking-wide text-slate-400 font-medium">
                  Hồ sơ pháp lý
                </div>
                {Object.entries(PHAN_LOAI_PHAP_LY).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNhomHoSo(key)}
                    className={`w-full text-left pl-6 pr-3 py-2 rounded-md text-sm transition ${
                      nhomHoSo === key ? "bg-blue-600 text-white font-medium" : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Danh sách hồ sơ trong nhóm đang chọn */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">
                    {nhomHoSo === "thietbi" ? NHOM_HO_SO.thietbi.ten : `Hồ sơ pháp lý — ${PHAN_LOAI_PHAP_LY[nhomHoSo]}`}
                  </span>
                  <button
                    onClick={() =>
                      setHoSo((prev) => [
                        {
                          id: Date.now(),
                          ten: "Hồ sơ mới",
                          nhom: nhomHoSo === "thietbi" ? "thietbi" : "phaply",
                          phanLoai: nhomHoSo === "thietbi" ? undefined : nhomHoSo,
                          loai: nhomHoSo === "thietbi" ? "Biên bản" : undefined,
                          ngayCapNhat: toDateStr(new Date()),
                        },
                        ...prev,
                      ])
                    }
                    className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-500 transition whitespace-nowrap"
                  >
                    <Plus size={15} /> Thêm hồ sơ
                  </button>
                </div>
                <div className="rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="bg-blue-50 text-slate-500 text-left">
                        <th className="p-3 font-medium">Tên hồ sơ</th>
                        <th className="p-3 font-medium">Cập nhật gần nhất</th>
                        <th className="p-3 font-medium w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {hoSo
                        .filter((h) => (nhomHoSo === "thietbi" ? h.nhom === "thietbi" : h.phanLoai === nhomHoSo))
                        .filter((h) => h.ten.toLowerCase().includes(timHoSo.toLowerCase()))
                        .map((h) => (
                          <tr key={h.id} className="border-t border-slate-200">
                            <td className="p-3 font-medium">
                              <input
                                value={h.ten}
                                onChange={(e) => setHoSo((prev) => prev.map((x) => (x.id === h.id ? { ...x, ten: e.target.value } : x)))}
                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                              />
                            </td>
                            <td className="p-3 text-slate-600 font-mono text-xs">{h.ngayCapNhat}</td>
                            <td className="p-3">
                              <button
                                onClick={() => setHoSo((prev) => prev.filter((x) => x.id !== h.id))}
                                className="text-slate-400 hover:text-red-600 transition"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {hoSo.filter((h) => (nhomHoSo === "thietbi" ? h.nhom === "thietbi" : h.phanLoai === nhomHoSo)).filter((h) => h.ten.toLowerCase().includes(timHoSo.toLowerCase())).length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-slate-500 text-sm italic">
                            Chưa có hồ sơ trong mục này
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modal phân ca */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-30"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-blue-50 border border-slate-300 rounded-lg w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Phân ca — {modal.ca.split(" ")[0]} {modal.ca.split(" ")[1]}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="text-xs text-slate-500 mb-3 font-mono">{modal.dateStr}</div>

            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {(phanCa[key(modal.dateStr, modal.ca)] || []).map((x) => (
                <div key={x.nvId} className="flex items-center justify-between bg-slate-100 rounded px-3 py-2 text-sm">
                  <span>{tenNV(x.nvId)} <span className="text-blue-600">· {x.viTri}</span></span>
                  <button onClick={() => xoaPhanCa(modal.dateStr, modal.ca, x.nvId)} className="text-slate-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <ThemNguoiVaoCa
              nhanVien={nhanVien}
              daPhan={(phanCa[key(modal.dateStr, modal.ca)] || []).map((x) => x.nvId)}
              onThem={(nvId, viTri) => themPhanCa(modal.dateStr, modal.ca, nvId, viTri)}
            />
          </div>
        </div>
      )}

      {/* Modal thêm nhân viên */}
      {showThemNV && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-30"
          onClick={() => setShowThemNV(false)}
        >
          <ThemNhanVienForm
            onCancel={() => setShowThemNV(false)}
            onSave={(nv) => {
              setNhanVien((prev) => [...prev, { id: Date.now(), ...nv }]);
              setShowThemNV(false);
            }}
          />
        </div>
      )}

      {/* Modal thiết lập ngưỡng cảnh báo */}
      {showNguongModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-30"
          onClick={() => setShowNguongModal(false)}
        >
          <div
            className="bg-blue-50 border border-slate-300 rounded-lg w-full max-w-lg p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Ngưỡng cảnh báo — {configThongSo[bangThongSoChon].ten}
              </h3>
              <button onClick={() => setShowNguongModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Để trống nếu không cần giới hạn. Ô nhập dữ liệu sẽ tô đỏ khi giá trị vượt ngưỡng.
            </p>
            <div className="space-y-2">
              {configThongSo[bangThongSoChon].cols.map((c) => {
                const n = layNguong(bangThongSoChon, c.key);
                return (
                  <div key={c.key} className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-slate-600 truncate">
                      {c.label} {c.unit && <span className="text-slate-400">({c.unit})</span>}
                    </span>
                    <input
                      type="number"
                      value={n.min ?? ""}
                      onChange={(e) => suaNguong(bangThongSoChon, c.key, "min", e.target.value)}
                      placeholder="Min"
                      className="w-20 bg-slate-100 rounded px-2 py-1 text-sm border border-slate-300"
                    />
                    <input
                      type="number"
                      value={n.max ?? ""}
                      onChange={(e) => suaNguong(bangThongSoChon, c.key, "max", e.target.value)}
                      placeholder="Max"
                      className="w-20 bg-slate-100 rounded px-2 py-1 text-sm border border-slate-300"
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowNguongModal(false)}
              className="w-full bg-blue-600 text-white font-medium rounded px-3 py-2 text-sm transition mt-4"
            >
              Xong
            </button>
          </div>
        </div>
      )}

      {/* Modal thêm bảng thông số mới */}
      {showThemBang && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-30"
          onClick={() => setShowThemBang(false)}
        >
          <ThemBangThongSoForm
            nhomCoSan={[...new Set(Object.values(configThongSo).map((c) => c.nhom))]}
            onCancel={() => setShowThemBang(false)}
            onSave={(data) => {
              taoBangMoi(data);
              setShowThemBang(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ThemNguoiVaoCa({ nhanVien, daPhan, onThem }) {
  const [nvId, setNvId] = useState("");
  const [viTri, setViTri] = useState(VI_TRI[0]);
  const khaDung = nhanVien.filter((n) => !daPhan.includes(n.id));

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
      <select
        value={nvId}
        onChange={(e) => setNvId(e.target.value)}
        className="bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300"
      >
        <option value="">— Chọn nhân viên —</option>
        {khaDung.map((n) => (
          <option key={n.id} value={n.id}>
            {n.ten}
          </option>
        ))}
      </select>
      <select
        value={viTri}
        onChange={(e) => setViTri(e.target.value)}
        className="bg-slate-100 rounded px-2 py-1.5 text-sm border border-slate-300"
      >
        {VI_TRI.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
      <button
        disabled={!nvId}
        onClick={() => {
          onThem(Number(nvId), viTri);
          setNvId("");
        }}
        className="bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded px-3 py-2 text-sm transition"
      >
        Thêm vào ca
      </button>
    </div>
  );
}

function ThemNhanVienForm({ onCancel, onSave }) {
  const [ten, setTen] = useState("");
  const [chucVu, setChucVu] = useState("Kỹ thuật viên");
  const [to, setTo] = useState("Tổ vận hành A");

  return (
    <div className="bg-blue-50 border border-slate-300 rounded-lg w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Thêm nhân viên</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-3">
        <input
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Họ và tên"
          className="w-full bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300"
        />
        <select
          value={chucVu}
          onChange={(e) => setChucVu(e.target.value)}
          className="w-full bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300"
        >
          <option>Kỹ thuật viên</option>
          <option>Trưởng ca</option>
          <option>Trực phụ</option>
        </select>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Tổ vận hành"
          className="w-full bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300"
        />
        <button
          disabled={!ten.trim()}
          onClick={() => onSave({ ten, chucVu, to })}
          className="w-full bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded px-3 py-2 text-sm transition"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}

function ThemBangThongSoForm({ nhomCoSan, onCancel, onSave }) {
  const [ten, setTen] = useState("");
  const [nhom, setNhom] = useState(nhomCoSan[0] || "Khác");
  const [nhomMoi, setNhomMoi] = useState("");
  const [dungNhomMoi, setDungNhomMoi] = useState(false);
  const [cols, setCols] = useState([{ label: "", unit: "" }]);

  function suaCol(i, field, val) {
    setCols((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  }
  function themCol() {
    setCols((prev) => [...prev, { label: "", unit: "" }]);
  }
  function xoaCol(i) {
    setCols((prev) => prev.filter((_, idx) => idx !== i));
  }

  const colsHopLe = cols.filter((c) => c.label.trim());
  const hopLe = ten.trim() && colsHopLe.length > 0 && (dungNhomMoi ? nhomMoi.trim() : nhom);

  function luu() {
    const colsFinal = colsHopLe.map((c, i) => ({
      key: "c" + i + "_" + c.label.replace(/\s+/g, ""),
      label: c.label,
      unit: c.unit,
    }));
    onSave({ ten, nhom: dungNhomMoi ? nhomMoi.trim() : nhom, cols: colsFinal });
  }

  return (
    <div
      className="bg-blue-50 border border-slate-300 rounded-lg w-full max-w-md p-5 max-h-[85vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Thêm bảng thông số mới</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          Tên bảng
          <input
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            placeholder="VD: Thông số kích từ H1"
            className="bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300 text-slate-900"
          />
        </label>

        <label className="text-xs text-slate-500 flex flex-col gap-1">
          Thuộc nhóm
          {!dungNhomMoi ? (
            <select
              value={nhom}
              onChange={(e) => setNhom(e.target.value)}
              className="bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300 text-slate-900"
            >
              {nhomCoSan.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          ) : (
            <input
              value={nhomMoi}
              onChange={(e) => setNhomMoi(e.target.value)}
              placeholder="Tên nhóm mới"
              className="bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300 text-slate-900"
            />
          )}
          <button
            type="button"
            onClick={() => setDungNhomMoi((v) => !v)}
            className="text-blue-600 text-xs self-start mt-0.5 hover:underline"
          >
            {dungNhomMoi ? "← Chọn nhóm có sẵn" : "+ Tạo nhóm mới"}
          </button>
        </label>

        <div>
          <div className="text-xs text-slate-500 mb-1.5">Các cột thông số (tên + đơn vị)</div>
          <div className="space-y-2">
            {cols.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={c.label}
                  onChange={(e) => suaCol(i, "label", e.target.value)}
                  placeholder="Tên thông số, VD: Điện áp"
                  className="flex-1 bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300 text-slate-900"
                />
                <input
                  value={c.unit}
                  onChange={(e) => suaCol(i, "unit", e.target.value)}
                  placeholder="Đơn vị"
                  className="w-24 bg-slate-100 rounded px-3 py-2 text-sm border border-slate-300 text-slate-900"
                />
                <button onClick={() => xoaCol(i)} className="text-slate-400 hover:text-red-600 px-1">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={themCol}
            className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Plus size={13} /> Thêm cột
          </button>
        </div>

        <button
          disabled={!hopLe}
          onClick={luu}
          className="w-full bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded px-3 py-2 text-sm transition mt-2"
        >
          Tạo bảng
        </button>
      </div>
    </div>
  );
}
