import type { Chapter, Sentence } from "@/types/library";

const lazyWorkImports: Record<string, () => Promise<{ chapters: Chapter[]; sentences: Sentence[]; overrides: Record<string, Record<string, [string, string, string]>> }>> = {
  work_tt: () => import("./library/thuong-thu").then(m => ({ chapters: m.ttChapters, sentences: m.ttSentences, overrides: m.ttOverrides })),
  work_cdt: () => import("./library/cong-duong-truyen").then(m => ({ chapters: m.cdtChapters, sentences: m.cdtSentences, overrides: m.cdtOverrides })),
  work_ttr: () => import("./library/ta-truyen").then(m => ({ chapters: m.ttrChapters, sentences: m.ttrSentences, overrides: m.ttrOverrides })),
  work_clt: () => import("./library/coc-luong-truyen").then(m => ({ chapters: m.cltChapters, sentences: m.cltSentences, overrides: m.cltOverrides })),
  work_su_ky: () => import("./library/su-ky").then(m => ({ chapters: m.suKyChapters, sentences: m.suKySentences, overrides: m.suKyOverrides })),
  work_han_thu: () => import("./library/han-thu").then(m => ({ chapters: m.hanThuChapters, sentences: m.hanThuSentences, overrides: m.hanThuOverrides })),
  work_hau_han: () => import("./library/hau-han-thu").then(m => ({ chapters: m.hauHanChapters, sentences: m.hauHanSentences, overrides: m.hauHanOverrides })),
  work_tam_quoc: () => import("./library/tam-quoc-chi").then(m => ({ chapters: m.tamQuocChapters, sentences: m.tamQuocSentences, overrides: m.tamQuocOverrides })),
  work_tan_thu: () => import("./library/tan-thu").then(m => ({ chapters: m.tanThuChapters, sentences: m.tanThuSentences, overrides: m.tanThuOverrides })),
  work_tong_thu: () => import("./library/tong-thu").then(m => ({ chapters: m.tongThuChapters, sentences: m.tongThuSentences, overrides: m.tongThuOverrides })),
  work_nam_te: () => import("./library/nam-te-thu").then(m => ({ chapters: m.namTeChapters, sentences: m.namTeSentences, overrides: m.namTeOverrides })),
  work_luong_thu: () => import("./library/luong-thu").then(m => ({ chapters: m.luongThuChapters, sentences: m.luongThuSentences, overrides: m.luongThuOverrides })),
  work_tran_thu: () => import("./library/tran-thu").then(m => ({ chapters: m.tranThuChapters, sentences: m.tranThuSentences, overrides: m.tranThuOverrides })),
  work_nguy_thu: () => import("./library/nguy-thu").then(m => ({ chapters: m.nguyThuChapters, sentences: m.nguyThuSentences, overrides: m.nguyThuOverrides })),
  work_bac_te: () => import("./library/bac-te-thu").then(m => ({ chapters: m.bacTeChapters, sentences: m.bacTeSentences, overrides: m.bacTeOverrides })),
  work_chu_thu: () => import("./library/chu-thu").then(m => ({ chapters: m.chuThuChapters, sentences: m.chuThuSentences, overrides: m.chuThuOverrides })),
  work_tuy_thu: () => import("./library/tuy-thu").then(m => ({ chapters: m.tuyThuChapters, sentences: m.tuyThuSentences, overrides: m.tuyThuOverrides })),
  work_nam_su: () => import("./library/nam-su").then(m => ({ chapters: m.namSuChapters, sentences: m.namSuSentences, overrides: m.namSuOverrides })),
  work_bac_su: () => import("./library/bac-su").then(m => ({ chapters: m.bacSuChapters, sentences: m.bacSuSentences, overrides: m.bacSuOverrides })),
  work_cuu_duong: () => import("./library/cuu-duong-thu").then(m => ({ chapters: m.cuuDuongChapters, sentences: m.cuuDuongSentences, overrides: m.cuuDuongOverrides })),
  work_tan_duong: () => import("./library/tan-duong-thu").then(m => ({ chapters: m.tanDuongChapters, sentences: m.tanDuongSentences, overrides: m.tanDuongOverrides })),
  work_cuu_ngu_dai: () => import("./library/cuu-ngu-dai-su").then(m => ({ chapters: m.cuuNguDaiChapters, sentences: m.cuuNguDaiSentences, overrides: m.cuuNguDaiOverrides })),
  work_tan_ngu_dai: () => import("./library/tan-ngu-dai-su").then(m => ({ chapters: m.tanNguDaiChapters, sentences: m.tanNguDaiSentences, overrides: m.tanNguDaiOverrides })),
  work_tong_su: () => import("./library/tong-su").then(m => ({ chapters: m.tongSuChapters, sentences: m.tongSuSentences, overrides: m.tongSuOverrides })),
  work_lieu_su: () => import("./library/lieu-su").then(m => ({ chapters: m.lieuSuChapters, sentences: m.lieuSuSentences, overrides: m.lieuSuOverrides })),
  work_kim_su: () => import("./library/kim-su").then(m => ({ chapters: m.kimSuChapters, sentences: m.kimSuSentences, overrides: m.kimSuOverrides })),
  work_nguyen_su: () => import("./library/nguyen-su").then(m => ({ chapters: m.nguyenSuChapters, sentences: m.nguyenSuSentences, overrides: m.nguyenSuOverrides })),
  work_minh_su: () => import("./library/minh-su").then(m => ({ chapters: m.minhSuChapters, sentences: m.minhSuSentences, overrides: m.minhSuOverrides })),
  work_thanh_su: () => import("./library/thanh-su-cao").then(m => ({ chapters: m.thanhSuChapters, sentences: m.thanhSuSentences, overrides: m.thanhSuOverrides })),
  work_tan_nguyen: () => import("./library/tan-nguyen-su").then(m => ({ chapters: m.tanNguyenChapters, sentences: m.tanNguyenSentences, overrides: m.tanNguyenOverrides })),
};

export const LAZY_WORK_IDS = new Set(Object.keys(lazyWorkImports));

export async function loadLazyWorkData(workId: string): Promise<{ chapters: Chapter[]; sentences: Sentence[]; overrides: Record<string, Record<string, [string, string, string]>> } | null> {
  const loader = lazyWorkImports[workId];
  if (!loader) return null;
  return loader();
}
