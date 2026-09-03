import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const meta = JSON.parse(fs.readFileSync(path.join(__dirname, "zi-works.json"), "utf8"));

const tierB = {
  nhan_hoc_ky: {
    id: "work_nhk", filename: "nhan-hoc-ky.ts", prefix: "nhk",
    titleViet: "Nhan Thị Học Ký", titleHan: "顏氏學記",
    authorId: "auth_dai_vong", iconChar: "顏",
    githubPath: "3.子/1.儒家/颜氏学记（清）戴望.json",
    tagIds: ["t4","t21","t19"]
  },
  khong_tu_tap_ngu: {
    id: "work_kttn", filename: "khong-tu-tap-ngu.ts", prefix: "kttn",
    titleViet: "Khổng Tử Tập Ngữ", titleHan: "孔子集語",
    authorId: "auth_ton_tinh_dien", iconChar: "孔",
    githubPath: "3.子/1.儒家/孔子集语（清）孙星衍.json",
    tagIds: ["t4","t21","t11","t19"]
  },
  tan_ngu_hieu_chu: {
    id: "work_tnhc", filename: "tan-ngu-hieu-chu.ts", prefix: "tnhc",
    titleViet: "Tân Ngữ Hiệu Chú", titleHan: "新語校注",
    authorId: "auth_vuong_loi_khi", iconChar: "語",
    githubPath: "3.子/1.儒家/新語校注王利器.json",
    tagIds: ["t4","t21","t13","t19"]
  },
  the_pham: {
    id: "work_tp", filename: "the-pham.ts", prefix: "tp",
    titleViet: "Thế Phạm", titleHan: "世範",
    authorId: "auth_vien_thai", iconChar: "範",
    githubPath: "3.子/1.儒家/世范（宋）袁采.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  gia_pham: {
    id: "work_gp", filename: "gia-pham.ts", prefix: "gp",
    titleViet: "Gia Phạm", titleHan: "家範",
    authorId: "auth_tu_ma_quang", iconChar: "家",
    githubPath: "3.子/1.儒家/家范（宋）司马光.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  khong_tu_gia_ngu: {
    id: "work_ktgn", filename: "khong-tu-gia-ngu.ts", prefix: "ktgn",
    titleViet: "Khổng Tử Gia Ngữ Chú", titleHan: "孔子家語注",
    authorId: "auth_vuong_tuc", iconChar: "語",
    githubPath: "3.子/1.儒家/孔子家語注 王肅注.json",
    tagIds: ["t4","t21","t11","t19"]
  },
  diem_thiet_luan: {
    id: "work_dtl", filename: "diem-thiet-luan.ts", prefix: "dtl",
    titleViet: "Diêm Thiết Luận", titleHan: "鹽鐵論",
    authorId: "auth_hoan_khoan", iconChar: "鹽",
    githubPath: "3.子/1.儒家/盐铁论（西汉）桓宽.json",
    tagIds: ["t4","t21","t13","t19"]
  },
  can_tu_luc: {
    id: "work_ctl", filename: "can-tu-luc.ts", prefix: "ctl",
    titleViet: "Cận Tư Lục", titleHan: "近思錄",
    authorId: "auth_chu_hi", iconChar: "思",
    githubPath: "3.子/1.儒家/近思錄（宋）朱熹 吕祖謙.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  truong_tu_chinh_mong: {
    id: "work_ttcm", filename: "truong-tu-chinh-mong.ts", prefix: "ttcm",
    titleViet: "Trương Tử Chính Mông Chú", titleHan: "張子正蒙注",
    authorId: "auth_vuong_phu_chi", iconChar: "蒙",
    githubPath: "3.子/1.儒家/张子正蒙注（清）王夫之.json",
    tagIds: ["t4","t21","t19"]
  },
  tan_thu_gia_nghi: {
    id: "work_ttgn", filename: "tan-thu-gn.ts", prefix: "tanThuGN",
    titleViet: "Tân Thư", titleHan: "新書",
    authorId: "auth_gia_nghi", iconChar: "書",
    githubPath: "3.子/1.儒家/新书（西汉）贾谊.json",
    tagIds: ["t4","t21","t13","t19"]
  },
  tan_tu: {
    id: "work_tan_tu", filename: "tan-tu-lh.ts", prefix: "tanTuLH",
    titleViet: "Tân Tự", titleHan: "新序",
    authorId: "auth_luu_huong", iconChar: "序",
    githubPath: "3.子/1.儒家/新序（汉）刘向.json",
    tagIds: ["t4","t21","t13","t19"]
  },
  thien_lam_tang_bao: {
    id: "work_tltb", filename: "thien-lam-tang-bao.ts", prefix: "tltb",
    titleViet: "Thiền Lâm Tăng Bảo Truyện", titleHan: "禪林僧寶傳",
    authorId: "auth_giac_pham", iconChar: "禪",
    githubPath: "3.子/5.释家/禅林僧宝传（宋）释觉范.json",
    tagIds: ["t21","t22","t15","t19"]
  },
  kim_cang_kinh: {
    id: "work_kck", filename: "kim-cang-kinh.ts", prefix: "kck",
    titleViet: "Kim Cang Kinh Tập Chú", titleHan: "金剛經集注",
    authorId: "auth_chu_de", iconChar: "金",
    githubPath: "3.子/5.释家/金刚经集注（明）朱棣主编.json",
    tagIds: ["t21","t22","t19"]
  },
  luc_to_dan_kinh: {
    id: "work_ltdk", filename: "luc-to-dan-kinh.ts", prefix: "ltdk",
    titleViet: "Lục Tổ Đàn Kinh", titleHan: "六祖壇經",
    authorId: "auth_tue_nang", iconChar: "壇",
    githubPath: "3.子/5.释家/六祖坛经（唐）释慧能.json",
    tagIds: ["t21","t22","t14","t19"]
  },
  luyen_binh: {
    id: "work_lb", filename: "luyen-binh.ts", prefix: "lb",
    titleViet: "Luyện Binh Thực Kỷ", titleHan: "練兵實紀",
    authorId: "auth_thich_ke_quang", iconChar: "兵",
    githubPath: "3.子/6.兵学/练兵实纪（明）戚继光.json",
    tagIds: ["t21","t26","t19"]
  },
  ho_kiem_kinh: {
    id: "work_hkk", filename: "ho-kiem-kinh.ts", prefix: "hkk",
    titleViet: "Hổ Kiềm Kinh", titleHan: "虎鈐經",
    authorId: "auth_hua_dong", iconChar: "虎",
    githubPath: "3.子/6.兵学/虎钤经（宋）许洞.json",
    tagIds: ["t21","t26","t15","t19"]
  },
  bach_chien_ky_luoc: {
    id: "work_bckl", filename: "bach-chien-ky-luoc.ts", prefix: "bckl",
    titleViet: "Bách Chiến Kỳ Lược", titleHan: "百戰奇略",
    authorId: "auth_luu_co", iconChar: "戰",
    githubPath: "3.子/6.兵学/百战奇略（明）刘基.json",
    tagIds: ["t21","t26","t19"]
  },
  ton_tu_luoc_giai: {
    id: "work_ttlg", filename: "ton-tu-luoc-giai.ts", prefix: "ttlg",
    titleViet: "Tôn Tử Lược Giải", titleHan: "孫子略解",
    authorId: "auth_tao_thao", iconChar: "孫",
    githubPath: "3.子/6.兵学/孫子略解（魏）曹操.json",
    tagIds: ["t21","t26","t19"]
  },
  tri_bac_ngau_dam: {
    id: "work_tbnd", filename: "tri-bac-ngau-dam.ts", prefix: "tbnd",
    titleViet: "Trì Bắc Ngẫu Đàm", titleHan: "池北偶談",
    authorId: "auth_vuong_si_trinh", iconChar: "池",
    githubPath: "3.子/12.杂家/杂说/池北偶谈（清）王士禛.json",
    tagIds: ["t4","t21","t19"]
  },
  hac_lam_ngoc_lo: {
    id: "work_hlnl", filename: "hac-lam-ngoc-lo.ts", prefix: "hlnl",
    titleViet: "Hạc Lâm Ngọc Lộ", titleHan: "鶴林玉露",
    authorId: "auth_la_dai_kinh", iconChar: "鶴",
    githubPath: "3.子/12.杂家/杂说/鹤林玉露（宋）罗大经.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  te_dong_da_ngu: {
    id: "work_tddn", filename: "te-dong-da-ngu.ts", prefix: "tddn",
    titleViet: "Tề Đông Dã Ngữ", titleHan: "齊東野語",
    authorId: "auth_chu_mat", iconChar: "齊",
    githubPath: "3.子/12.杂家/杂说/齐东野语（宋）周密.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  da_khach_tung_thu: {
    id: "work_dktt", filename: "da-khach-tung-thu.ts", prefix: "dktt",
    titleViet: "Dã Khách Tùng Thư", titleHan: "野客叢書",
    authorId: "auth_vuong_mau", iconChar: "野",
    githubPath: "3.子/12.杂家/杂考/野客丛书（宋）王楙 撰.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  bach_ho_thong_nghia: {
    id: "work_bhtn", filename: "bach-ho-thong-nghia.ts", prefix: "bhtn",
    titleViet: "Bạch Hổ Thông Nghĩa", titleHan: "白虎通義",
    authorId: "auth_ban_co_2", iconChar: "通",
    githubPath: "3.子/12.杂家/杂考/白虎通义（东汉）班固.json",
    tagIds: ["t4","t21","t13","t19"]
  },
  truong_doan_kinh: {
    id: "work_tdk", filename: "truong-doan-kinh.ts", prefix: "tdk",
    titleViet: "Trường Đoản Kinh", titleHan: "長短經",
    authorId: "auth_trieu_nhuy", iconChar: "經",
    githubPath: "3.子/12.杂家/杂学/长短经（唐）赵蕤撰.json",
    tagIds: ["t4","t21","t14","t19"]
  },
  dong_pha_chi_lam: {
    id: "work_dpcl", filename: "dong-pha-chi-lam.ts", prefix: "dpcl",
    titleViet: "Đông Pha Chí Lâm", titleHan: "東坡志林",
    authorId: "auth_su_shi", iconChar: "坡",
    githubPath: "3.子/12.杂家/杂说/東坡志林（宋）蘇軾.json",
    tagIds: ["t4","t21","t15","t19"]
  },
  quy_coc_tu: {
    id: "work_qct", filename: "quy-coc-tu.ts", prefix: "qct",
    titleViet: "Quỷ Cốc Tử", titleHan: "鬼谷子",
    authorId: "auth_dao_hong_canh", iconChar: "鬼",
    githubPath: "3.子/12.杂家/杂学/鬼谷子（梁）陶弘景注.json",
    tagIds: ["t4","t21","t19"]
  },
  tong_bai_loai_sao: {
    id: "work_tblsx", filename: "tong-bai-loai-sao.ts", prefix: "tblsx",
    titleViet: "Tống Bại Loại Sao", titleHan: "宋稗類鈔",
    authorId: "auth_phan_vinh_nhan", iconChar: "宋",
    githubPath: "3.子/13.类书/宋稗類鈔（清）潘永因編.json",
    tagIds: ["t21","t25","t15","t19"]
  },
  that_tu_loai_cao: {
    id: "work_ttlc", filename: "that-tu-loai-cao.ts", prefix: "ttlc",
    titleViet: "Thất Tu Loại Cảo", titleHan: "七修類稿",
    authorId: "auth_lang_anh", iconChar: "七",
    githubPath: "3.子/13.类书/七修类稿（明）郎锳.json",
    tagIds: ["t21","t25","t19"]
  },
  duong_ngu_lam: {
    id: "work_dnl", filename: "duong-ngu-lam.ts", prefix: "dnl",
    titleViet: "Đường Ngữ Lâm", titleHan: "唐語林",
    authorId: "auth_vuong_dang", iconChar: "林",
    githubPath: "3.子/15.小说家/杂事/唐语林（宋）王谠.json",
    tagIds: ["t21","t24","t14","t19"]
  },
  tu_trieu_van_kien: {
    id: "work_ttvk", filename: "tu-trieu-van-kien.ts", prefix: "ttvk",
    titleViet: "Tứ Triều Văn Kiến Lục", titleHan: "四朝聞見錄",
    authorId: "auth_diep_thieu_ong", iconChar: "四",
    githubPath: "3.子/15.小说家/杂事/四朝闻见录（宋）叶绍翁.json",
    tagIds: ["t21","t24","t15","t19"]
  },
  bac_mong_toa_ngon: {
    id: "work_bmtn", filename: "bac-mong-toa-ngon.ts", prefix: "bmtn",
    titleViet: "Bắc Mộng Toả Ngôn", titleHan: "北夢瑣言",
    authorId: "auth_ton_quang_hien", iconChar: "夢",
    githubPath: "3.子/15.小说家/杂事/北梦琐言（五代）孙光宪 陈尚君再补.json",
    tagIds: ["t21","t24","t19"]
  },
  dai_duong_tan_ngu: {
    id: "work_ddtn", filename: "dai-duong-tan-ngu.ts", prefix: "ddtn",
    titleViet: "Đại Đường Tân Ngữ", titleHan: "大唐新語",
    authorId: "auth_luu_tuc", iconChar: "唐",
    githubPath: "3.子/15.小说家/杂事/大唐新语（唐）刘肃.json",
    tagIds: ["t21","t24","t14","t19"]
  },
  suu_than_ky: {
    id: "work_stk", filename: "suu-than-ky.ts", prefix: "stk",
    titleViet: "Sưu Thần Ký", titleHan: "搜神記",
    authorId: "auth_can_bao", iconChar: "搜",
    githubPath: "3.子/15.小说家/异闻/搜神記（晉）干寶等著.json",
    tagIds: ["t21","t24","t19"]
  },
  tuyen_hoa_hoa_pho: {
    id: "work_thhp", filename: "tuyen-hoa-hoa-pho.ts", prefix: "thhp",
    titleViet: "Tuyên Hoà Hoạ Phổ", titleHan: "宣和畫譜",
    authorId: "auth_tuyen_hoa", iconChar: "畫",
    githubPath: "3.子/9.艺术/宣和画谱.json",
    tagIds: ["t21","t19"]
  },
  cuu_chuong_toan_kinh: {
    id: "work_cctk", filename: "cuu-chuong-toan-kinh.ts", prefix: "cctk",
    titleViet: "Cửu Chương Toán Kinh", titleHan: "九章算經",
    authorId: "auth_luu_huy", iconChar: "算",
    githubPath: "3.子/10.天文算法/九章算經（晉）劉徽注.json",
    tagIds: ["t21","t19"]
  },
};

Object.assign(meta, tierB);
fs.writeFileSync(path.join(__dirname, "zi-works.json"), JSON.stringify(meta, null, 2));
console.log("Added " + Object.keys(tierB).length + " Tier B entries to zi-works.json");
