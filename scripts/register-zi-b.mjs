import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");
const libDir = path.join(dataDir, "library");

// ── New authors for Tier B ──
const newAuthors = [
  { id: "auth_dai_vong", nameViet: "Đới Vọng", nameHan: "戴望", era: "1837–1873", dynasty: "Thanh", bio: "Học giả đời Thanh, biên soạn Nhan Thị Học Ký tổng hợp tư tưởng Nhan Nguyên." },
  { id: "auth_ton_tinh_dien", nameViet: "Tôn Tinh Diễn", nameHan: "孫星衍", era: "1753–1818", dynasty: "Thanh", bio: "Đại học giả đời Thanh, sưu tập và hiệu chú Khổng Tử Tập Ngữ." },
  { id: "auth_vuong_loi_khi", nameViet: "Vương Lợi Khí (hiệu chú)", nameHan: "王利器（校注）", era: "1912–1998", dynasty: "Hiện đại", bio: "Nhà nghiên cứu cổ điển, hiệu chú nhiều tác phẩm Hán đại." },
  { id: "auth_vien_thai", nameViet: "Viên Thái", nameHan: "袁采", era: "?–1195", dynasty: "Nam Tống", bio: "Quan lại triều Tống, viết Thế Phạm dạy xử thế, quản gia, giáo dục." },
  { id: "auth_tu_ma_quang", nameViet: "Tư Mã Quang", nameHan: "司馬光", era: "1019–1086", dynasty: "Bắc Tống", bio: "Sử gia, chính trị gia đời Bắc Tống, tác giả Tư Trị Thông Giám, viết Gia Phạm dạy trị gia." },
  { id: "auth_vuong_tuc", nameViet: "Vương Túc (chú)", nameHan: "王肅（注）", era: "195–256", dynasty: "Tào Ngụy", bio: "Kinh học gia đời Ngụy, chú giải Khổng Tử Gia Ngữ." },
  { id: "auth_hoan_khoan", nameViet: "Hoàn Khoan", nameHan: "桓寬", era: "~thế kỷ 1 TCN", dynasty: "Tây Hán", bio: "Học giả Tây Hán, ghi chép lại cuộc tranh luận về chính sách muối sắt thành Diêm Thiết Luận." },
  { id: "auth_chu_hi", nameViet: "Chu Hi & Lữ Tổ Khiêm", nameHan: "朱熹、呂祖謙", era: "1130–1200", dynasty: "Nam Tống", bio: "Chu Hi là đại nho Nam Tống, sáng lập Lý Học, cùng Lữ Tổ Khiêm biên soạn Cận Tư Lục." },
  { id: "auth_vuong_phu_chi", nameViet: "Vương Phu Chi", nameHan: "王夫之", era: "1619–1692", dynasty: "Thanh", bio: "Triết gia cuối Minh đầu Thanh, chú giải Trương Tử Chính Mông." },
  { id: "auth_gia_nghi", nameViet: "Giả Nghị", nameHan: "賈誼", era: "200–168 TCN", dynasty: "Tây Hán", bio: "Chính trị gia, văn nhân đời Tây Hán, tác giả Tân Thư bàn về trị quốc." },
  { id: "auth_giac_pham", nameViet: "Thích Giác Phạm (Huệ Hồng)", nameHan: "釋覺範（惠洪）", era: "1071–1128", dynasty: "Bắc Tống", bio: "Thiền sư Lâm Tế tông, biên soạn Thiền Lâm Tăng Bảo Truyện ghi chép 81 thiền sư." },
  { id: "auth_chu_de", nameViet: "Minh Thành Tổ (chủ biên)", nameHan: "明成祖朱棣（編）", era: "1360–1424", dynasty: "Minh", bio: "Hoàng đế thứ ba nhà Minh, chủ biên Kim Cang Kinh Tập Chú tổng hợp chú giải kinh Kim Cang." },
  { id: "auth_tue_nang", nameViet: "Lục Tổ Huệ Năng", nameHan: "六祖慧能", era: "638–713", dynasty: "Đường", bio: "Tổ thứ sáu Thiền tông Trung Hoa, tác giả Pháp Bảo Đàn Kinh." },
  { id: "auth_thich_ke_quang", nameViet: "Thích Kế Quang", nameHan: "戚繼光", era: "1528–1588", dynasty: "Minh", bio: "Danh tướng chống Oa đời Minh, viết Luyện Binh Thực Kỷ về huấn luyện quân sự." },
  { id: "auth_hua_dong", nameViet: "Hứa Động", nameHan: "許洞", era: "976–1015", dynasty: "Bắc Tống", bio: "Học giả quân sự đời Bắc Tống, biên soạn Hổ Kiềm Kinh về binh pháp." },
  { id: "auth_luu_co", nameViet: "Lưu Cơ", nameHan: "劉基", era: "1311–1375", dynasty: "Minh", bio: "Mưu sĩ khai quốc nhà Minh, biên soạn Bách Chiến Kỳ Lược tổng hợp chiến thuật." },
  { id: "auth_tao_thao", nameViet: "Tào Tháo", nameHan: "曹操", era: "155–220", dynasty: "Đông Hán–Tào Ngụy", bio: "Nhà chính trị, quân sự kiệt xuất cuối Hán, chú giải Tôn Tử Binh Pháp." },
  { id: "auth_vuong_si_trinh", nameViet: "Vương Sĩ Trinh", nameHan: "王士禛", era: "1634–1711", dynasty: "Thanh", bio: "Thi nhân, học giả đời Thanh, viết Trì Bắc Ngẫu Đàm — bộ bút ký đồ sộ." },
  { id: "auth_la_dai_kinh", nameViet: "La Đại Kinh", nameHan: "羅大經", era: "~thế kỷ 13", dynasty: "Nam Tống", bio: "Văn nhân Nam Tống, viết Hạc Lâm Ngọc Lộ bàn về thơ văn, nhân vật." },
  { id: "auth_chu_mat", nameViet: "Chu Mật", nameHan: "周密", era: "1232–1298", dynasty: "Nam Tống–Nguyên", bio: "Văn nhân cuối Tống, viết Tề Đông Dã Ngữ ghi chép sự kiện lịch sử Nam Tống." },
  { id: "auth_vuong_mau", nameViet: "Vương Mậu", nameHan: "王楙", era: "~thế kỷ 12", dynasty: "Nam Tống", bio: "Học giả Nam Tống, biên soạn Dã Khách Tùng Thư — khảo chứng cổ kim." },
  { id: "auth_ban_co_2", nameViet: "Ban Cố (chủ biên)", nameHan: "班固", era: "32–92", dynasty: "Đông Hán", bio: "Sử gia đời Đông Hán, tác giả Hán Thư, chủ biên Bạch Hổ Thông Nghĩa ghi lại thảo luận kinh học." },
  { id: "auth_trieu_nhuy", nameViet: "Triệu Nhụy", nameHan: "趙蕤", era: "~thế kỷ 7–8", dynasty: "Đường", bio: "Ẩn sĩ đời Đường, viết Trường Đoản Kinh bàn về quyền biến, mưu lược." },
  { id: "auth_su_shi", nameViet: "Tô Thức (Tô Đông Pha)", nameHan: "蘇軾", era: "1037–1101", dynasty: "Bắc Tống", bio: "Đại văn hào, thi nhân Bắc Tống, viết Đông Pha Chí Lâm — tùy bút ghi chép đời sống." },
  { id: "auth_dao_hong_canh", nameViet: "Đào Hoằng Cảnh (chú)", nameHan: "陶弘景（注）", era: "456–536", dynasty: "Lương", bio: "Đạo sĩ, y gia, dược học gia đời Lương, chú giải Quỷ Cốc Tử." },
  { id: "auth_phan_vinh_nhan", nameViet: "Phan Vĩnh Nhân (biên)", nameHan: "潘永因（編）", era: "~thế kỷ 17", dynasty: "Thanh", bio: "Biên tập gia đời Thanh, sưu tập giai thoại triều Tống thành Tống Bại Loại Sao." },
  { id: "auth_lang_anh", nameViet: "Lang Anh", nameHan: "郎瑛", era: "1487–~1566", dynasty: "Minh", bio: "Văn nhân đời Minh, viết Thất Tu Loại Cảo bàn về thiên văn, địa lý, nhân vật." },
  { id: "auth_vuong_dang", nameViet: "Vương Đảng", nameHan: "王讜", era: "~thế kỷ 11–12", dynasty: "Bắc Tống", bio: "Văn nhân Bắc Tống, mô phỏng Thế Thuyết viết Đường Ngữ Lâm ghi giai thoại triều Đường." },
  { id: "auth_diep_thieu_ong", nameViet: "Diệp Thiệu Ông", nameHan: "葉紹翁", era: "~thế kỷ 13", dynasty: "Nam Tống", bio: "Văn nhân Nam Tống, ghi lại sự kiện bốn triều Tống trong Tứ Triều Văn Kiến Lục." },
  { id: "auth_ton_quang_hien", nameViet: "Tôn Quang Hiến", nameHan: "孫光憲", era: "~900–968", dynasty: "Ngũ Đại", bio: "Văn nhân thời Ngũ Đại, viết Bắc Mộng Toả Ngôn ghi chuyện cuối Đường, Ngũ Đại." },
  { id: "auth_luu_tuc", nameViet: "Lưu Túc", nameHan: "劉肅", era: "~thế kỷ 8", dynasty: "Đường", bio: "Văn nhân đời Đường, viết Đại Đường Tân Ngữ ghi giai thoại triều Đường." },
  { id: "auth_can_bao", nameViet: "Can Bảo", nameHan: "干寶", era: "~286–336", dynasty: "Đông Tấn", bio: "Sử gia, văn nhân Đông Tấn, biên soạn Sưu Thần Ký — tập truyện chí quái tiêu biểu." },
  { id: "auth_tuyen_hoa", nameViet: "Tống Huy Tông (ngự soạn)", nameHan: "宋徽宗（御撰）", era: "1082–1135", dynasty: "Bắc Tống", bio: "Hoàng đế họa sĩ triều Tống, ngự soạn Tuyên Hoà Hoạ Phổ ghi chép danh họa." },
  { id: "auth_luu_huy", nameViet: "Lưu Huy (chú)", nameHan: "劉徽（注）", era: "~thế kỷ 3", dynasty: "Tào Ngụy", bio: "Nhà toán học đời Ngụy, chú giải Cửu Chương Toán Thuật — bộ sách toán cổ nhất Trung Hoa." },
];

// ── Work entries with actual conversion data ──
const newWorks = [
  { id: "work_nhk", titleViet: "Nhan Thị Học Ký", titleHan: "顏氏學記", authorId: "auth_dai_vong", chapterCount: 11, characterCount: 138652, language: "han_van", isPublished: true, iconChar: "顏", progressPercent: 0, tagIds: ["t4","t21","t19"] },
  { id: "work_kttn", titleViet: "Khổng Tử Tập Ngữ", titleHan: "孔子集語", authorId: "auth_ton_tinh_dien", chapterCount: 20, characterCount: 121496, language: "han_van", isPublished: true, iconChar: "孔", progressPercent: 0, tagIds: ["t4","t21","t11","t19"] },
  { id: "work_tnhc", titleViet: "Tân Ngữ Hiệu Chú", titleHan: "新語校注", authorId: "auth_vuong_loi_khi", chapterCount: 15, characterCount: 112429, language: "han_van", isPublished: true, iconChar: "語", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_tp", titleViet: "Thế Phạm", titleHan: "世範", authorId: "auth_vien_thai", chapterCount: 4, characterCount: 128671, language: "han_van", isPublished: true, iconChar: "範", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_gp", titleViet: "Gia Phạm", titleHan: "家範", authorId: "auth_tu_ma_quang", chapterCount: 14, characterCount: 123333, language: "han_van", isPublished: true, iconChar: "家", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_ktgn", titleViet: "Khổng Tử Gia Ngữ Chú", titleHan: "孔子家語注", authorId: "auth_vuong_tuc", chapterCount: 10, characterCount: 71898, language: "han_van", isPublished: true, iconChar: "語", progressPercent: 0, tagIds: ["t4","t21","t11","t19"] },
  { id: "work_dtl", titleViet: "Diêm Thiết Luận", titleHan: "鹽鐵論", authorId: "auth_hoan_khoan", chapterCount: 10, characterCount: 49953, language: "han_van", isPublished: true, iconChar: "鹽", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_ctl", titleViet: "Cận Tư Lục", titleHan: "近思錄", authorId: "auth_chu_hi", chapterCount: 18, characterCount: 42962, language: "han_van", isPublished: true, iconChar: "思", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_ttcm", titleViet: "Trương Tử Chính Mông Chú", titleHan: "張子正蒙注", authorId: "auth_vuong_phu_chi", chapterCount: 11, characterCount: 96632, language: "han_van", isPublished: true, iconChar: "蒙", progressPercent: 0, tagIds: ["t4","t21","t19"] },
  { id: "work_ttgn", titleViet: "Tân Thư", titleHan: "新書", authorId: "auth_gia_nghi", chapterCount: 10, characterCount: 42833, language: "han_van", isPublished: true, iconChar: "書", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_tan_tu", titleViet: "Tân Tự", titleHan: "新序", authorId: "auth_luu_huong", chapterCount: 11, characterCount: 48077, language: "han_van", isPublished: true, iconChar: "序", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_tltb", titleViet: "Thiền Lâm Tăng Bảo Truyện", titleHan: "禪林僧寶傳", authorId: "auth_giac_pham", chapterCount: 32, characterCount: 86732, language: "han_van", isPublished: true, iconChar: "禪", progressPercent: 0, tagIds: ["t21","t22","t15","t19"] },
  { id: "work_kck", titleViet: "Kim Cang Kinh Tập Chú", titleHan: "金剛經集注", authorId: "auth_chu_de", chapterCount: 38, characterCount: 78430, language: "han_van", isPublished: true, iconChar: "金", progressPercent: 0, tagIds: ["t21","t22","t19"] },
  { id: "work_ltdk", titleViet: "Lục Tổ Đàn Kinh", titleHan: "六祖壇經", authorId: "auth_tue_nang", chapterCount: 1, characterCount: 11705, language: "han_van", isPublished: true, iconChar: "壇", progressPercent: 0, tagIds: ["t21","t22","t14","t19"] },
  { id: "work_lb", titleViet: "Luyện Binh Thực Kỷ", titleHan: "練兵實紀", authorId: "auth_thich_ke_quang", chapterCount: 17, characterCount: 93625, language: "han_van", isPublished: true, iconChar: "兵", progressPercent: 0, tagIds: ["t21","t26","t19"] },
  { id: "work_hkk", titleViet: "Hổ Kiềm Kinh", titleHan: "虎鈐經", authorId: "auth_hua_dong", chapterCount: 22, characterCount: 71039, language: "han_van", isPublished: true, iconChar: "虎", progressPercent: 0, tagIds: ["t21","t26","t15","t19"] },
  { id: "work_bckl", titleViet: "Bách Chiến Kỳ Lược", titleHan: "百戰奇略", authorId: "auth_luu_co", chapterCount: 10, characterCount: 25340, language: "han_van", isPublished: true, iconChar: "戰", progressPercent: 0, tagIds: ["t21","t26","t19"] },
  { id: "work_ttlg", titleViet: "Tôn Tử Lược Giải", titleHan: "孫子略解", authorId: "auth_tao_thao", chapterCount: 1, characterCount: 10895, language: "han_van", isPublished: true, iconChar: "孫", progressPercent: 0, tagIds: ["t21","t26","t19"] },
  { id: "work_tbnd", titleViet: "Trì Bắc Ngẫu Đàm", titleHan: "池北偶談", authorId: "auth_vuong_si_trinh", chapterCount: 28, characterCount: 215543, language: "han_van", isPublished: true, iconChar: "池", progressPercent: 0, tagIds: ["t4","t21","t19"] },
  { id: "work_hlnl", titleViet: "Hạc Lâm Ngọc Lộ", titleHan: "鶴林玉露", authorId: "auth_la_dai_kinh", chapterCount: 20, characterCount: 132851, language: "han_van", isPublished: true, iconChar: "鶴", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_tddn", titleViet: "Tề Đông Dã Ngữ", titleHan: "齊東野語", authorId: "auth_chu_mat", chapterCount: 21, characterCount: 127576, language: "han_van", isPublished: true, iconChar: "齊", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_dktt", titleViet: "Dã Khách Tùng Thư", titleHan: "野客叢書", authorId: "auth_vuong_mau", chapterCount: 32, characterCount: 133710, language: "han_van", isPublished: true, iconChar: "野", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_bhtn", titleViet: "Bạch Hổ Thông Nghĩa", titleHan: "白虎通義", authorId: "auth_ban_co_2", chapterCount: 12, characterCount: 47910, language: "han_van", isPublished: true, iconChar: "通", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_tdk", titleViet: "Trường Đoản Kinh", titleHan: "長短經", authorId: "auth_trieu_nhuy", chapterCount: 9, characterCount: 79311, language: "han_van", isPublished: true, iconChar: "經", progressPercent: 0, tagIds: ["t4","t21","t14","t19"] },
  { id: "work_dpcl", titleViet: "Đông Pha Chí Lâm", titleHan: "東坡志林", authorId: "auth_su_shi", chapterCount: 6, characterCount: 39621, language: "han_van", isPublished: true, iconChar: "坡", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_qct", titleViet: "Quỷ Cốc Tử", titleHan: "鬼谷子", authorId: "auth_dao_hong_canh", chapterCount: 17, characterCount: 22377, language: "han_van", isPublished: true, iconChar: "鬼", progressPercent: 0, tagIds: ["t4","t21","t19"] },
  { id: "work_tblsx", titleViet: "Tống Bại Loại Sao", titleHan: "宋稗類鈔", authorId: "auth_phan_vinh_nhan", chapterCount: 9, characterCount: 310114, language: "han_van", isPublished: true, iconChar: "宋", progressPercent: 0, tagIds: ["t21","t25","t15","t19"] },
  { id: "work_ttlc", titleViet: "Thất Tu Loại Cảo", titleHan: "七修類稿", authorId: "auth_lang_anh", chapterCount: 52, characterCount: 270861, language: "han_van", isPublished: true, iconChar: "七", progressPercent: 0, tagIds: ["t21","t25","t19"] },
  { id: "work_dnl", titleViet: "Đường Ngữ Lâm", titleHan: "唐語林", authorId: "auth_vuong_dang", chapterCount: 24, characterCount: 126261, language: "han_van", isPublished: true, iconChar: "林", progressPercent: 0, tagIds: ["t21","t24","t14","t19"] },
  { id: "work_ttvk", titleViet: "Tứ Triều Văn Kiến Lục", titleHan: "四朝聞見錄", authorId: "auth_diep_thieu_ong", chapterCount: 9, characterCount: 86075, language: "han_van", isPublished: true, iconChar: "四", progressPercent: 0, tagIds: ["t21","t24","t15","t19"] },
  { id: "work_bmtn", titleViet: "Bắc Mộng Toả Ngôn", titleHan: "北夢瑣言", authorId: "auth_ton_quang_hien", chapterCount: 27, characterCount: 81451, language: "han_van", isPublished: true, iconChar: "夢", progressPercent: 0, tagIds: ["t21","t24","t19"] },
  { id: "work_ddtn", titleViet: "Đại Đường Tân Ngữ", titleHan: "大唐新語", authorId: "auth_luu_tuc", chapterCount: 14, characterCount: 65585, language: "han_van", isPublished: true, iconChar: "唐", progressPercent: 0, tagIds: ["t21","t24","t14","t19"] },
  { id: "work_stk", titleViet: "Sưu Thần Ký", titleHan: "搜神記", authorId: "auth_can_bao", chapterCount: 22, characterCount: 57274, language: "han_van", isPublished: true, iconChar: "搜", progressPercent: 0, tagIds: ["t21","t24","t19"] },
  { id: "work_thhp", titleViet: "Tuyên Hoà Hoạ Phổ", titleHan: "宣和畫譜", authorId: "auth_tuyen_hoa", chapterCount: 21, characterCount: 59620, language: "han_van", isPublished: true, iconChar: "畫", progressPercent: 0, tagIds: ["t21","t19"] },
  { id: "work_cctk", titleViet: "Cửu Chương Toán Kinh", titleHan: "九章算經", authorId: "auth_luu_huy", chapterCount: 12, characterCount: 24549, language: "han_van", isPublished: true, iconChar: "算", progressPercent: 0, tagIds: ["t21","t19"] },
];

// ── Lazy imports ──
const lazyImports = {
  work_nhk: { file: "nhan-hoc-ky", prefix: "nhk" },
  work_kttn: { file: "khong-tu-tap-ngu", prefix: "kttn" },
  work_tnhc: { file: "tan-ngu-hieu-chu", prefix: "tnhc" },
  work_tp: { file: "the-pham", prefix: "tp" },
  work_gp: { file: "gia-pham", prefix: "gp" },
  work_ktgn: { file: "khong-tu-gia-ngu", prefix: "ktgn" },
  work_dtl: { file: "diem-thiet-luan", prefix: "dtl" },
  work_ctl: { file: "can-tu-luc", prefix: "ctl" },
  work_ttcm: { file: "truong-tu-chinh-mong", prefix: "ttcm" },
  work_ttgn: { file: "tan-thu-gn", prefix: "tanThuGN" },
  work_tan_tu: { file: "tan-tu-lh", prefix: "tanTuLH" },
  work_tltb: { file: "thien-lam-tang-bao", prefix: "tltb" },
  work_kck: { file: "kim-cang-kinh", prefix: "kck" },
  work_ltdk: { file: "luc-to-dan-kinh", prefix: "ltdk" },
  work_lb: { file: "luyen-binh", prefix: "lb" },
  work_hkk: { file: "ho-kiem-kinh", prefix: "hkk" },
  work_bckl: { file: "bach-chien-ky-luoc", prefix: "bckl" },
  work_ttlg: { file: "ton-tu-luoc-giai", prefix: "ttlg" },
  work_tbnd: { file: "tri-bac-ngau-dam", prefix: "tbnd" },
  work_hlnl: { file: "hac-lam-ngoc-lo", prefix: "hlnl" },
  work_tddn: { file: "te-dong-da-ngu", prefix: "tddn" },
  work_dktt: { file: "da-khach-tung-thu", prefix: "dktt" },
  work_bhtn: { file: "bach-ho-thong-nghia", prefix: "bhtn" },
  work_tdk: { file: "truong-doan-kinh", prefix: "tdk" },
  work_dpcl: { file: "dong-pha-chi-lam", prefix: "dpcl" },
  work_qct: { file: "quy-coc-tu", prefix: "qct" },
  work_tblsx: { file: "tong-bai-loai-sao", prefix: "tblsx" },
  work_ttlc: { file: "that-tu-loai-cao", prefix: "ttlc" },
  work_dnl: { file: "duong-ngu-lam", prefix: "dnl" },
  work_ttvk: { file: "tu-trieu-van-kien", prefix: "ttvk" },
  work_bmtn: { file: "bac-mong-toa-ngon", prefix: "bmtn" },
  work_ddtn: { file: "dai-duong-tan-ngu", prefix: "ddtn" },
  work_stk: { file: "suu-than-ky", prefix: "stk" },
  work_thhp: { file: "tuyen-hoa-hoa-pho", prefix: "thhp" },
  work_cctk: { file: "cuu-chuong-toan-kinh", prefix: "cctk" },
};

// ═══════════════════════════════════════
// 1. Add authors
// ═══════════════════════════════════════
console.log("1. Adding authors...");
const authorsPath = path.join(libDir, "authors.ts");
let authSrc = fs.readFileSync(authorsPath, "utf8");
let authCount = 0;
for (const a of newAuthors) {
  if (authSrc.includes(`"${a.id}"`)) { console.log(`  Author ${a.id} exists`); continue; }
  const line = `  ${JSON.stringify(a)},`;
  authSrc = authSrc.replace(/\n\];\s*$/, `\n${line}\n];\n`);
  authCount++;
}
fs.writeFileSync(authorsPath, authSrc, "utf8");
console.log(`  Added ${authCount} new authors`);

// ═══════════════════════════════════════
// 2. Add works
// ═══════════════════════════════════════
console.log("\n2. Adding works...");
const worksPath = path.join(libDir, "works.ts");
let worksSrc = fs.readFileSync(worksPath, "utf8");
let workCount = 0;
for (const w of newWorks) {
  if (worksSrc.includes(`"${w.id}"`)) { console.log(`  Work ${w.id} exists`); continue; }
  const line = `  ${JSON.stringify(w)},`;
  worksSrc = worksSrc.replace(/\n\];\s*$/, `\n${line}\n];\n`);
  workCount++;
}
fs.writeFileSync(worksPath, worksSrc, "utf8");
console.log(`  Added ${workCount} new works`);

// ═══════════════════════════════════════
// 3. Add lazy imports
// ═══════════════════════════════════════
console.log("\n3. Adding lazy imports...");
const lazyPath = path.join(dataDir, "lazy-works.ts");
let lazySrc = fs.readFileSync(lazyPath, "utf8");
let lazyCount = 0;
for (const [wid, { file, prefix }] of Object.entries(lazyImports)) {
  if (lazySrc.includes(`${wid}:`)) { console.log(`  ${wid} import exists`); continue; }
  const importLine = `  ${wid}: () => import("./library/tu/${file}").then(m => ({ chapters: m.${prefix}Chapters, sentences: m.${prefix}Sentences, overrides: m.${prefix}Overrides })),`;
  lazySrc = lazySrc.replace(/^(\};\s*$)/m, `${importLine}\n$1`);
  lazyCount++;
}
fs.writeFileSync(lazyPath, lazySrc, "utf8");
console.log(`  Added ${lazyCount} lazy imports`);

console.log(`\nDone! Registered ${workCount} Tier B works with ${authCount} authors and ${lazyCount} lazy imports.`);
