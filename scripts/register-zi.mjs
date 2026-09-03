import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");
const libDir = path.join(dataDir, "library");

// ── New tags ──
const newTags = [
  { id: "t21", name: "Tử (Chư tử)", category: "type", sortOrder: 6 },
  { id: "t22", name: "Phật giáo", category: "genre", sortOrder: 6 },
  { id: "t23", name: "Y học", category: "genre", sortOrder: 7 },
  { id: "t24", name: "Tiểu thuyết", category: "genre", sortOrder: 8 },
  { id: "t25", name: "Loại thư", category: "genre", sortOrder: 9 },
  { id: "t26", name: "Binh pháp", category: "genre", sortOrder: 10 },
];

// ── New authors ──
const newAuthors = [
  { id: "auth_tuan_tu", nameViet: "Tuân Tử (Tuân Huống)", nameHan: "荀子（荀況）", era: "~313–238 TCN", dynasty: "Chiến Quốc", bio: "Nhà tư tưởng Nho gia hậu kỳ Chiến Quốc, chủ trương tính ác luận, đề cao lễ nghĩa." },
  { id: "auth_luu_huong", nameViet: "Lưu Hướng", nameHan: "劉向", era: "77–6 TCN", dynasty: "Tây Hán", bio: "Học giả, văn nhân đời Tây Hán, biên soạn Thuyết Uyển, Tân Tự, Liệt Nữ Truyện." },
  { id: "auth_lu_bat_vi", nameViet: "Lữ Bất Vi (chủ biên)", nameHan: "呂不韋（編）", era: "~291–235 TCN", dynasty: "Chiến Quốc–Tần", bio: "Tể tướng nước Tần, tập hợp môn khách biên soạn Lữ Thị Xuân Thu." },
  { id: "auth_luu_an", nameViet: "Lưu An", nameHan: "劉安", era: "179–122 TCN", dynasty: "Tây Hán", bio: "Hoài Nam vương đời Tây Hán, chiêu mộ tân khách biên soạn Hoài Nam Tử." },
  { id: "auth_tue_kieu", nameViet: "Thích Tuệ Kiểu", nameHan: "釋慧皎", era: "497–554", dynasty: "Lương", bio: "Cao tăng triều Lương, biên soạn Cao Tăng Truyện ghi chép 257 vị cao tăng." },
  { id: "auth_hdnk", nameViet: "Khuyết danh (truyền thuyết Hoàng Đế)", nameHan: "黃帝（傳說）", era: "~Chiến Quốc", dynasty: "Chiến Quốc", bio: "Hoàng Đế Nội Kinh là bộ y thư cổ nhất Trung Hoa, gồm Tố Vấn và Linh Khu." },
  { id: "auth_hoang_phu_mat", nameViet: "Hoàng Phủ Mật", nameHan: "皇甫謐", era: "215–282", dynasty: "Tây Tấn", bio: "Y gia, học giả Tây Tấn, biên soạn Châm Cứu Giáp Ất Kinh — bộ sách châm cứu có hệ thống đầu tiên." },
  { id: "auth_vien_kha", nameViet: "Viên Kha (hiệu chú)", nameHan: "袁珂（校註）", era: "1916–2001", dynasty: "Hiện đại", bio: "Nhà nghiên cứu thần thoại Trung Hoa, hiệu chú Sơn Hải Kinh với chú giải chi tiết." },
  { id: "auth_ton_di_nhuong", nameViet: "Tôn Di Nhượng (chú sớ)", nameHan: "孫詒讓（閒詁）", era: "1848–1908", dynasty: "Thanh", bio: "Đại học giả đời Thanh, viết Mặc Tử Nhàn Cổ — bộ chú giải quan trọng nhất cho Mặc Tử." },
  { id: "auth_vuong_sung", nameViet: "Vương Sung / Hoàng Huy (hiệu thích)", nameHan: "王充撰／黃暉校釋", era: "27–97", dynasty: "Đông Hán", bio: "Vương Sung là triết gia duy vật luận đời Đông Hán, tác giả Luận Hành phê phán mê tín." },
  { id: "auth_ung_thieu", nameViet: "Ứng Thiệu / Vương Lợi Khí (hiệu chú)", nameHan: "應劭撰／王利器校注", era: "~153–196", dynasty: "Đông Hán", bio: "Ứng Thiệu là học giả Đông Hán, ghi chép phong tục xã hội trong Phong Tục Thông Nghĩa." },
  { id: "auth_nhan_chi_thoi", nameViet: "Nhan Chi Thôi / Vương Lợi Khí (tập giải)", nameHan: "顏之推著／王利器集解", era: "531–591+", dynasty: "Bắc Tề–Tùy", bio: "Nhan Chi Thôi sống qua nhiều triều loạn, viết Nhan Thị Gia Huấn dạy con cháu." },
  { id: "auth_hong_mai", nameViet: "Hồng Mại", nameHan: "洪邁", era: "1123–1202", dynasty: "Nam Tống", bio: "Văn nhân Nam Tống, tác giả bộ bút ký đồ sộ Dung Trai Tuỳ Bút (5 tập, 74 quyển)." },
  { id: "auth_dao_tuyen", nameViet: "Thích Đạo Tuyên", nameHan: "釋道宣", era: "596–667", dynasty: "Đường", bio: "Luật sư Phật giáo đời Đường, sáng lập tông Nam Sơn Luật, biên soạn Tục Cao Tăng Truyện." },
  { id: "auth_duong_hung", nameViet: "Dương Hùng / Uông Vinh Bảo (nghĩa sớ)", nameHan: "揚雄撰／汪榮寶注疏", era: "53 TCN–18", dynasty: "Tây Hán", bio: "Dương Hùng là văn nhân, triết gia Tây Hán, tác giả Pháp Ngôn mô phỏng Luận Ngữ." },
  { id: "auth_luu_nghia_khanh", nameViet: "Lưu Nghĩa Khánh / Dư Gia Tích (tiên sớ)", nameHan: "劉義慶撰／余嘉錫箋疏", era: "403–444", dynasty: "Nam Triều Tống", bio: "Lưu Nghĩa Khánh là hoàng thân Lưu Tống, biên soạn Thế Thuyết Tân Ngữ — kho tàng giai thoại danh sĩ." },
  { id: "auth_vuong_thu_nhan", nameViet: "Vương Thủ Nhân (Vương Dương Minh)", nameHan: "王守仁（王陽明）", era: "1472–1529", dynasty: "Minh", bio: "Triết gia, nhà quân sự đời Minh, sáng lập Dương Minh Tâm Học, chủ trương tri hành hợp nhất." },
  { id: "auth_au_duong_van", nameViet: "Âu Dương Tuân", nameHan: "歐陽詢", era: "557–641", dynasty: "Đường", bio: "Thư pháp gia, học giả đời Đường, biên soạn bộ bách khoa Nghệ Văn Loại Tụ." },
  { id: "auth_tu_kien", nameViet: "Từ Kiên", nameHan: "徐堅", era: "659–729", dynasty: "Đường", bio: "Học giả đời Đường, chủ biên Sơ Học Ký — bộ loại thư dùng cho giáo dục." },
  { id: "auth_ngu_the_nam", nameViet: "Ngu Thế Nam", nameHan: "虞世南", era: "558–638", dynasty: "Đường", bio: "Thư pháp gia, học giả thời Sơ Đường, biên soạn Bắc Đường Thư Sao." },
  { id: "auth_le_tinh_duc", nameViet: "Lê Tĩnh Đức (biên)", nameHan: "黎靖德（編）", dynasty: "Nam Tống", bio: "Biên tập gia đời Nam Tống, sưu tập lời giảng của Chu Hi thành Chu Tử Ngữ Loại." },
  { id: "auth_au_duong_canh_vo", nameViet: "Âu Dương Cánh Vô (biên)", nameHan: "歐陽竟無（編）", era: "1871–1943", dynasty: "Cận đại", bio: "Phật học gia cận đại, biên tập Tạng Yếu — tuyển tập kinh điển Phật giáo." },
  { id: "auth_ly_phong_2", nameViet: "Lý Phưởng", nameHan: "李昉", era: "925–996", dynasty: "Bắc Tống", bio: "Tể tướng Bắc Tống, chủ biên Thái Bình Quảng Ký — bộ truyện ký đồ sộ 500 quyển." },
  { id: "auth_ly_phong", nameViet: "Lý Phưởng (chủ biên)", nameHan: "李昉等撰", era: "925–996", dynasty: "Bắc Tống", bio: "Chủ biên Thái Bình Ngự Lãm — bộ bách khoa 1000 quyển, hoàn thành năm 983." },
  { id: "auth_tu_kha", nameViet: "Từ Kha (biên)", nameHan: "徐珂（編）", era: "1869–1928", dynasty: "Cận đại", bio: "Biên tập gia, sưu tập giai thoại triều Thanh thành Thanh Bại Loại Sao." },
  { id: "auth_vuong_kham_nhuoc", nameViet: "Vương Khâm Nhược (chủ biên)", nameHan: "王欽若等編修", era: "962–1025", dynasty: "Bắc Tống", bio: "Tể tướng Bắc Tống, chủ biên Sách Phủ Nguyên Quy — bộ loại thư lớn nhất thời Tống." },
];

// ── Work entries ──
const newWorks = [
  { id: "work_tuan_tu", titleViet: "Tuân Tử", titleHan: "荀子", authorId: "auth_tuan_tu", chapterCount: 32, characterCount: 75390, language: "han_van", isPublished: true, iconChar: "荀", progressPercent: 0, tagIds: ["t4","t21","t12","t19"] },
  { id: "work_thuyet_uyen", titleViet: "Thuyết Uyển", titleHan: "說苑", authorId: "auth_luu_huong", chapterCount: 20, characterCount: 107357, language: "han_van", isPublished: true, iconChar: "苑", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_ltxt", titleViet: "Lữ Thị Xuân Thu", titleHan: "呂氏春秋", authorId: "auth_lu_bat_vi", chapterCount: 26, characterCount: 100617, language: "han_van", isPublished: true, iconChar: "呂", progressPercent: 0, tagIds: ["t4","t21","t12","t19"] },
  { id: "work_hnt", titleViet: "Hoài Nam Tử", titleHan: "淮南子", authorId: "auth_luu_an", chapterCount: 21, characterCount: 131157, language: "han_van", isPublished: true, iconChar: "淮", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_ctt", titleViet: "Cao Tăng Truyện", titleHan: "高僧傳", authorId: "auth_tue_kieu", chapterCount: 14, characterCount: 137220, language: "han_van", isPublished: true, iconChar: "僧", progressPercent: 0, tagIds: ["t21","t22","t19"] },
  { id: "work_hdnk", titleViet: "Hoàng Đế Nội Kinh", titleHan: "黃帝內經", authorId: "auth_hdnk", chapterCount: 160, characterCount: 147008, language: "han_van", isPublished: true, iconChar: "醫", progressPercent: 0, tagIds: ["t21","t23","t12","t19"] },
  { id: "work_ccgy", titleViet: "Châm Cứu Giáp Ất Kinh", titleHan: "針灸甲乙經", authorId: "auth_hoang_phu_mat", chapterCount: 14, characterCount: 116638, language: "han_van", isPublished: true, iconChar: "針", progressPercent: 0, tagIds: ["t21","t23","t19"] },
  { id: "work_shk", titleViet: "Sơn Hải Kinh Hiệu Chú", titleHan: "山海經校註", authorId: "auth_vien_kha", chapterCount: 21, characterCount: 170437, language: "han_van", isPublished: true, iconChar: "山", progressPercent: 0, tagIds: ["t21","t24","t19"] },
  { id: "work_mac_tu", titleViet: "Mặc Tử Nhàn Cổ", titleHan: "墨子閒詁", authorId: "auth_ton_di_nhuong", chapterCount: 21, characterCount: 373014, language: "han_van", isPublished: true, iconChar: "墨", progressPercent: 0, tagIds: ["t4","t21","t12","t19"] },
  { id: "work_luan_hanh", titleViet: "Luận Hành Hiệu Thích", titleHan: "論衡校釋", authorId: "auth_vuong_sung", chapterCount: 36, characterCount: 679999, language: "han_van", isPublished: true, iconChar: "衡", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_pttn", titleViet: "Phong Tục Thông Nghĩa Hiệu Chú", titleHan: "風俗通義校注", authorId: "auth_ung_thieu", chapterCount: 14, characterCount: 316438, language: "han_van", isPublished: true, iconChar: "俗", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_ntgh", titleViet: "Nhan Thị Gia Huấn Tập Giải", titleHan: "顏氏家訓集解", authorId: "auth_nhan_chi_thoi", chapterCount: 9, characterCount: 316029, language: "han_van", isPublished: true, iconChar: "訓", progressPercent: 0, tagIds: ["t4","t21","t19"] },
  { id: "work_dtbt", titleViet: "Dung Trai Tuỳ Bút", titleHan: "容齋隨筆", authorId: "auth_hong_mai", chapterCount: 77, characterCount: 331173, language: "han_van", isPublished: true, iconChar: "齋", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_tctt", titleViet: "Tục Cao Tăng Truyện", titleHan: "續高僧傳", authorId: "auth_dao_tuyen", chapterCount: 37, characterCount: 381231, language: "han_van", isPublished: true, iconChar: "續", progressPercent: 0, tagIds: ["t21","t22","t14","t19"] },
  { id: "work_phap_ngon", titleViet: "Pháp Ngôn Nghĩa Sớ", titleHan: "法言義疏", authorId: "auth_duong_hung", chapterCount: 22, characterCount: 358369, language: "han_van", isPublished: true, iconChar: "法", progressPercent: 0, tagIds: ["t4","t21","t13","t19"] },
  { id: "work_tttn", titleViet: "Thế Thuyết Tân Ngữ Tiên Sớ", titleHan: "世說新語箋疏", authorId: "auth_luu_nghia_khanh", chapterCount: 39, characterCount: 371204, language: "han_van", isPublished: true, iconChar: "說", progressPercent: 0, tagIds: ["t21","t24","t19"] },
  { id: "work_vtn", titleViet: "Vương Thủ Nhân Toàn Tập", titleHan: "王守仁全集", authorId: "auth_vuong_thu_nhan", chapterCount: 21, characterCount: 212556, language: "han_van", isPublished: true, iconChar: "陽", progressPercent: 0, tagIds: ["t4","t21","t19"] },
  { id: "work_nvlt", titleViet: "Nghệ Văn Loại Tụ", titleHan: "藝文類聚", authorId: "auth_au_duong_van", chapterCount: 100, characterCount: 918900, language: "han_van", isPublished: true, iconChar: "聚", progressPercent: 0, tagIds: ["t21","t25","t14","t19"] },
  { id: "work_shky", titleViet: "Sơ Học Ký", titleHan: "初學記", authorId: "auth_tu_kien", chapterCount: 30, characterCount: 493092, language: "han_van", isPublished: true, iconChar: "初", progressPercent: 0, tagIds: ["t21","t25","t14","t19"] },
  { id: "work_bdts", titleViet: "Bắc Đường Thư Sao", titleHan: "北堂書鈔", authorId: "auth_ngu_the_nam", chapterCount: 166, characterCount: 1191410, language: "han_van", isPublished: true, iconChar: "鈔", progressPercent: 0, tagIds: ["t21","t25","t14","t19"] },
  { id: "work_ctnl", titleViet: "Chu Tử Ngữ Loại", titleHan: "朱子語類", authorId: "auth_le_tinh_duc", chapterCount: 144, characterCount: 1585691, language: "han_van", isPublished: true, iconChar: "朱", progressPercent: 0, tagIds: ["t4","t21","t15","t19"] },
  { id: "work_tang_yeu", titleViet: "Tạng Yếu", titleHan: "藏要", authorId: "auth_au_duong_canh_vo", chapterCount: 518, characterCount: 3741878, language: "han_van", isPublished: true, iconChar: "藏", progressPercent: 0, tagIds: ["t21","t22","t19"] },
  { id: "work_tbqk", titleViet: "Thái Bình Quảng Ký", titleHan: "太平廣記", authorId: "auth_ly_phong_2", chapterCount: 503, characterCount: 4045310, language: "han_van", isPublished: true, iconChar: "廣", progressPercent: 0, tagIds: ["t21","t24","t15","t19"] },
  { id: "work_tbnl", titleViet: "Thái Bình Ngự Lãm", titleHan: "太平御覽", authorId: "auth_ly_phong", chapterCount: 1000, characterCount: 3802212, language: "han_van", isPublished: true, iconChar: "覽", progressPercent: 0, tagIds: ["t21","t25","t15","t19"] },
  { id: "work_tbls", titleViet: "Thanh Bại Loại Sao", titleHan: "清稗類鈔", authorId: "auth_tu_kha", chapterCount: 97, characterCount: 2651562, language: "han_van", isPublished: true, iconChar: "稗", progressPercent: 0, tagIds: ["t21","t25","t19"] },
  { id: "work_spnq", titleViet: "Sách Phủ Nguyên Quy", titleHan: "册府元龜", authorId: "auth_vuong_kham_nhuoc", chapterCount: 1001, characterCount: 8393868, language: "han_van", isPublished: true, iconChar: "冊", progressPercent: 0, tagIds: ["t21","t25","t15","t19"] },
];

// ── Lazy work imports ──
const lazyImports = {
  work_tuan_tu: { file: "tuan-tu", prefix: "tuanTu" },
  work_thuyet_uyen: { file: "thuyet-uyen", prefix: "thuyetUyen" },
  work_ltxt: { file: "lu-thi-xuan-thu", prefix: "ltxt" },
  work_hnt: { file: "hoai-nam-tu", prefix: "hnt" },
  work_ctt: { file: "cao-tang-truyen", prefix: "ctt" },
  work_hdnk: { file: "hoang-de-noi-kinh", prefix: "hdnk" },
  work_ccgy: { file: "cham-cuu-giap-at", prefix: "ccgy" },
  work_shk: { file: "son-hai-kinh", prefix: "shk" },
  work_mac_tu: { file: "mac-tu", prefix: "macTu" },
  work_luan_hanh: { file: "luan-hanh", prefix: "luanHanh" },
  work_pttn: { file: "phong-tuc-thong-nghia", prefix: "pttn" },
  work_ntgh: { file: "nhan-thi-gia-huan", prefix: "ntgh" },
  work_dtbt: { file: "dung-trai", prefix: "dtbt" },
  work_tctt: { file: "tuc-cao-tang", prefix: "tctt" },
  work_phap_ngon: { file: "phap-ngon", prefix: "phapNgon" },
  work_tttn: { file: "the-thuyet-tan-ngu", prefix: "tttn" },
  work_vtn: { file: "vuong-thu-nhan", prefix: "vtn" },
  work_nvlt: { file: "nghe-van-loai-tu", prefix: "nvlt" },
  work_shky: { file: "so-hoc-ky", prefix: "shky" },
  work_bdts: { file: "bac-duong-thu-sao", prefix: "bdts" },
  work_ctnl: { file: "chu-tu-ngu-loai", prefix: "ctnl" },
  work_tang_yeu: { file: "tang-yeu", prefix: "tangYeu" },
  work_tbqk: { file: "thai-binh-quang-ky", prefix: "tbqk" },
  work_tbnl: { file: "thai-binh-ngu-lam", prefix: "tbnl" },
  work_tbls: { file: "thanh-bai-loai-sao", prefix: "tbls" },
  work_spnq: { file: "sach-phu-nguyen-quy", prefix: "spnq" },
};

// ═══════════════════════════════════════
// 1. Add tags to mock-data.ts
// ═══════════════════════════════════════
console.log("1. Adding tags...");
const mockPath = path.join(__dirname, "..", "src", "lib", "mock-data.ts");
let mock = fs.readFileSync(mockPath, "utf8");
for (const tag of newTags) {
  if (mock.includes(`"${tag.id}"`)) { console.log(`  Tag ${tag.id} already exists`); continue; }
  const tagLine = `  { id: "${tag.id}", name: "${tag.name}", category: "${tag.category}", sortOrder: ${tag.sortOrder} },`;
  mock = mock.replace(/^(\];)\s*\n(const tagById)/m, `${tagLine}\n$1\n$2`);
  console.log(`  Added tag ${tag.id}: ${tag.name}`);
}
fs.writeFileSync(mockPath, mock, "utf8");

// ═══════════════════════════════════════
// 2. Add authors
// ═══════════════════════════════════════
console.log("\n2. Adding authors...");
const authorsPath = path.join(libDir, "authors.ts");
let authSrc = fs.readFileSync(authorsPath, "utf8");
for (const a of newAuthors) {
  if (authSrc.includes(`"${a.id}"`)) { console.log(`  Author ${a.id} exists`); continue; }
  const line = `  ${JSON.stringify(a)},`;
  authSrc = authSrc.replace(/\n\];\s*$/, `\n${line}\n];\n`);
  console.log(`  Added ${a.nameViet}`);
}
fs.writeFileSync(authorsPath, authSrc, "utf8");

// ═══════════════════════════════════════
// 3. Add works
// ═══════════════════════════════════════
console.log("\n3. Adding works...");
const worksPath = path.join(libDir, "works.ts");
let worksSrc = fs.readFileSync(worksPath, "utf8");
for (const w of newWorks) {
  if (worksSrc.includes(`"${w.id}"`)) { console.log(`  Work ${w.id} exists`); continue; }
  const line = `  ${JSON.stringify(w)},`;
  worksSrc = worksSrc.replace(/\n\];\s*$/, `\n${line}\n];\n`);
  console.log(`  Added ${w.titleViet} (${w.characterCount.toLocaleString()} chữ)`);
}
fs.writeFileSync(worksPath, worksSrc, "utf8");

// ═══════════════════════════════════════
// 4. Add lazy imports
// ═══════════════════════════════════════
console.log("\n4. Adding lazy imports...");
const lazyPath = path.join(dataDir, "lazy-works.ts");
let lazySrc = fs.readFileSync(lazyPath, "utf8");
for (const [wid, { file, prefix }] of Object.entries(lazyImports)) {
  if (lazySrc.includes(`${wid}:`)) { console.log(`  ${wid} import exists`); continue; }
  const importLine = `  ${wid}: () => import("./library/tu/${file}").then(m => ({ chapters: m.${prefix}Chapters, sentences: m.${prefix}Sentences, overrides: m.${prefix}Overrides })),`;
  lazySrc = lazySrc.replace(/^(\};\s*$)/m, `${importLine}\n$1`);
  console.log(`  Added ${wid} → ${file}.ts`);
}
fs.writeFileSync(lazySrc, lazySrc, "utf8");

console.log("\nDone! Registered all Tier A works.");
