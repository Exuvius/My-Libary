/**
 * Convert yijing_V2.1.json → src/data/library/dich-kinh.ts
 *
 * Each hexagram = 1 chapter.
 * Sentences per chapter:
 *   paragraphGroup 1: quái từ (gua_ci)
 *   paragraphGroup 2: thoán từ (tuan_ci)
 *   paragraphGroup 3: đại tượng (da_xiang)
 *   paragraphGroup 4: hào từ (yao_ci) — each line a sentence
 *   paragraphGroup 5: tiểu tượng (xiao_xiang) — each line a sentence
 *
 * Tagged explanations → annotations
 */

import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("scripts/yijing_raw.json", "utf-8"));

// Load simp→trad mapping from the existing data file
const stFile = readFileSync("src/data/simp-trad.ts", "utf-8");
const match = stFile.match(/export const simpToTrad[^{]*(\{[^;]+\});/s);
const simpToTrad = JSON.parse(match[1].replace(/'/g, '"'));

function toTrad(text) {
  return [...text].map(ch => simpToTrad[ch] || ch).join("");
}

// 64 hexagram Hán Việt names & Vietnamese names
const hexagramInfo = [
  { name: "乾", hanViet: "Càn", viet: "Trời" },
  { name: "坤", hanViet: "Khôn", viet: "Đất" },
  { name: "屯", hanViet: "Truân", viet: "Khó khăn ban đầu" },
  { name: "蒙", hanViet: "Mông", viet: "Mông muội" },
  { name: "需", hanViet: "Nhu", viet: "Chờ đợi" },
  { name: "讼", hanViet: "Tụng", viet: "Kiện tụng" },
  { name: "师", hanViet: "Sư", viet: "Quân đội" },
  { name: "比", hanViet: "Tỷ", viet: "Thân cận" },
  { name: "小畜", hanViet: "Tiểu Súc", viet: "Tích nhỏ" },
  { name: "履", hanViet: "Lý", viet: "Bước đi" },
  { name: "泰", hanViet: "Thái", viet: "Hanh thông" },
  { name: "否", hanViet: "Bĩ", viet: "Bế tắc" },
  { name: "同人", hanViet: "Đồng Nhân", viet: "Hòa đồng" },
  { name: "大有", hanViet: "Đại Hữu", viet: "Sở hữu lớn" },
  { name: "谦", hanViet: "Khiêm", viet: "Khiêm nhường" },
  { name: "豫", hanViet: "Dự", viet: "Vui vẻ" },
  { name: "随", hanViet: "Tùy", viet: "Theo" },
  { name: "蛊", hanViet: "Cổ", viet: "Sửa chữa" },
  { name: "临", hanViet: "Lâm", viet: "Đến gần" },
  { name: "观", hanViet: "Quan", viet: "Quan sát" },
  { name: "噬嗑", hanViet: "Phệ Hạp", viet: "Cắn ngậm" },
  { name: "贲", hanViet: "Bí", viet: "Trang sức" },
  { name: "剥", hanViet: "Bác", viet: "Bóc lột" },
  { name: "复", hanViet: "Phục", viet: "Trở lại" },
  { name: "无妄", hanViet: "Vô Vọng", viet: "Không vọng tưởng" },
  { name: "大畜", hanViet: "Đại Súc", viet: "Tích lớn" },
  { name: "颐", hanViet: "Di", viet: "Nuôi dưỡng" },
  { name: "大过", hanViet: "Đại Quá", viet: "Vượt quá lớn" },
  { name: "坎", hanViet: "Khảm", viet: "Hố nước" },
  { name: "离", hanViet: "Ly", viet: "Bám vào / Lửa" },
  { name: "咸", hanViet: "Hàm", viet: "Cảm ứng" },
  { name: "恒", hanViet: "Hằng", viet: "Bền bỉ" },
  { name: "遁", hanViet: "Độn", viet: "Rút lui" },
  { name: "大壮", hanViet: "Đại Tráng", viet: "Cường thịnh" },
  { name: "晋", hanViet: "Tấn", viet: "Tiến lên" },
  { name: "明夷", hanViet: "Minh Di", viet: "Che lấp ánh sáng" },
  { name: "家人", hanViet: "Gia Nhân", viet: "Gia đình" },
  { name: "睽", hanViet: "Khuê", viet: "Trái ngược" },
  { name: "蹇", hanViet: "Kiển", viet: "Khó khăn" },
  { name: "解", hanViet: "Giải", viet: "Giải thoát" },
  { name: "损", hanViet: "Tổn", viet: "Bớt đi" },
  { name: "益", hanViet: "Ích", viet: "Thêm vào" },
  { name: "夬", hanViet: "Quải", viet: "Quyết đoán" },
  { name: "姤", hanViet: "Cấu", viet: "Gặp gỡ" },
  { name: "萃", hanViet: "Tụy", viet: "Tụ hội" },
  { name: "升", hanViet: "Thăng", viet: "Thăng tiến" },
  { name: "困", hanViet: "Khốn", viet: "Bị khốn" },
  { name: "井", hanViet: "Tỉnh", viet: "Giếng nước" },
  { name: "革", hanViet: "Cách", viet: "Cách mạng" },
  { name: "鼎", hanViet: "Đỉnh", viet: "Cái đỉnh" },
  { name: "震", hanViet: "Chấn", viet: "Sấm sét" },
  { name: "艮", hanViet: "Cấn", viet: "Núi / Dừng lại" },
  { name: "渐", hanViet: "Tiệm", viet: "Tiến dần" },
  { name: "归妹", hanViet: "Quy Muội", viet: "Em gái về nhà chồng" },
  { name: "丰", hanViet: "Phong", viet: "Phong phú" },
  { name: "旅", hanViet: "Lữ", viet: "Lữ hành" },
  { name: "巽", hanViet: "Tốn", viet: "Gió / Thuận theo" },
  { name: "兑", hanViet: "Đoài", viet: "Vui vẻ / Hồ" },
  { name: "涣", hanViet: "Hoán", viet: "Phân tán" },
  { name: "节", hanViet: "Tiết", viet: "Tiết chế" },
  { name: "中孚", hanViet: "Trung Phu", viet: "Tín ở trong" },
  { name: "小过", hanViet: "Tiểu Quá", viet: "Vượt quá nhỏ" },
  { name: "既济", hanViet: "Ký Tế", viet: "Đã xong" },
  { name: "未济", hanViet: "Vị Tế", viet: "Chưa xong" },
];

// Section labels for hexagram groups (Thượng/Hạ Kinh)
function getSection(idx) {
  return idx < 30 ? "Thượng Kinh (上經)" : "Hạ Kinh (下經)";
}

const WORK_ID = "work_dk";
const chapters = [];
const sentences = [];
const annotations = [];
let sentenceCount = 0;
let totalChars = 0;

for (let i = 0; i < raw.length; i++) {
  const hex = raw[i];
  const info = hexagramInfo[i];
  const chId = `ch_${WORK_ID}_${i + 1}`;
  const tradName = toTrad(info.name);

  chapters.push({
    id: chId,
    workId: WORK_ID,
    titleViet: `${info.hanViet} ${hex.symbol}`,
    titleHan: tradName,
    chapterNumber: i + 1,
    sectionLabel: getSection(i),
    sortOrder: i + 1,
  });

  let order = 0;

  // 1. Quái từ (gua_ci)
  const guaCiTrad = toTrad(hex.gua_ci);
  order++;
  sentenceCount++;
  const guaSid = `s_dk_${sentenceCount}`;
  sentences.push({
    id: guaSid,
    chapterId: chId,
    textTraditional: guaCiTrad,
    textSimplified: hex.gua_ci,
    sentenceOrder: order,
    paragraphGroup: 1,
  });
  totalChars += [...hex.gua_ci].filter(c => c.match(/[一-鿿]/)).length;

  // Annotation from tagged_gua_ci
  if (hex.tagged_gua_ci?.level_1_explanation) {
    annotations.push({
      id: `an_dk_${sentenceCount}`,
      sentenceId: guaSid,
      level: "sentence",
      content: `【${toTrad(hex.tagged_gua_ci.level_1_tag || "")}】${hex.tagged_gua_ci.level_1_explanation}`,
    });
  }

  // 2. Thoán từ (tuan_ci)
  const tuanTrad = toTrad(hex.tuan_ci);
  order++;
  sentenceCount++;
  const tuanSid = `s_dk_${sentenceCount}`;
  sentences.push({
    id: tuanSid,
    chapterId: chId,
    textTraditional: tuanTrad,
    textSimplified: hex.tuan_ci,
    sentenceOrder: order,
    paragraphGroup: 2,
  });
  totalChars += [...hex.tuan_ci].filter(c => c.match(/[一-鿿]/)).length;

  if (hex.tagged_tuan_ci?.level_1_explanation) {
    annotations.push({
      id: `an_dk_${sentenceCount}`,
      sentenceId: tuanSid,
      level: "sentence",
      content: `【${toTrad(hex.tagged_tuan_ci.level_1_tag || "")}】${hex.tagged_tuan_ci.level_1_explanation}`,
    });
  }

  // 3. Đại tượng (da_xiang)
  const dxTrad = toTrad(hex.da_xiang);
  order++;
  sentenceCount++;
  const dxSid = `s_dk_${sentenceCount}`;
  sentences.push({
    id: dxSid,
    chapterId: chId,
    textTraditional: dxTrad,
    textSimplified: hex.da_xiang,
    sentenceOrder: order,
    paragraphGroup: 3,
  });
  totalChars += [...hex.da_xiang].filter(c => c.match(/[一-鿿]/)).length;

  if (hex.tagged_da_xiang?.level_1_explanation) {
    annotations.push({
      id: `an_dk_${sentenceCount}`,
      sentenceId: dxSid,
      level: "sentence",
      content: `【${toTrad(hex.tagged_da_xiang.level_1_tag || "")}】${hex.tagged_da_xiang.level_1_explanation}`,
    });
  }

  // 4. Hào từ (yao_ci)
  for (let j = 0; j < hex.yao_ci.length; j++) {
    const yaoTrad = toTrad(hex.yao_ci[j]);
    order++;
    sentenceCount++;
    const yaoSid = `s_dk_${sentenceCount}`;
    sentences.push({
      id: yaoSid,
      chapterId: chId,
      textTraditional: yaoTrad,
      textSimplified: hex.yao_ci[j],
      sentenceOrder: order,
      paragraphGroup: 4,
    });
    totalChars += [...hex.yao_ci[j]].filter(c => c.match(/[一-鿿]/)).length;

    if (hex.tagged_yao?.[j]?.level_1_explanation) {
      annotations.push({
        id: `an_dk_${sentenceCount}`,
        sentenceId: yaoSid,
        level: "sentence",
        content: `【${toTrad(hex.tagged_yao[j].level_1_tag || "")}】${hex.tagged_yao[j].level_1_explanation}`,
      });
    }
  }

  // 5. Tiểu tượng (xiao_xiang)
  for (let j = 0; j < hex.xiao_xiang.length; j++) {
    const xiaoTrad = toTrad(hex.xiao_xiang[j]);
    order++;
    sentenceCount++;
    const xiaoSid = `s_dk_${sentenceCount}`;
    sentences.push({
      id: xiaoSid,
      chapterId: chId,
      textTraditional: xiaoTrad,
      textSimplified: hex.xiao_xiang[j],
      sentenceOrder: order,
      paragraphGroup: 5,
    });
    totalChars += [...hex.xiao_xiang[j]].filter(c => c.match(/[一-鿿]/)).length;

    if (hex.tagged_xiao?.[j]?.level_1_explanation) {
      annotations.push({
        id: `an_dk_${sentenceCount}`,
        sentenceId: xiaoSid,
        level: "sentence",
        content: `【${toTrad(hex.tagged_xiao[j].level_1_tag || "")}】${hex.tagged_xiao[j].level_1_explanation}`,
      });
    }
  }
}

console.log(`Chapters: ${chapters.length}`);
console.log(`Sentences: ${sentences.length}`);
console.log(`Annotations: ${annotations.length}`);
console.log(`Total CJK chars: ${totalChars}`);

// Generate TypeScript
const ts = `import type { Chapter, Sentence, Annotation } from "@/types/library";

export const dkChapters: Chapter[] = ${JSON.stringify(chapters, null, 2)};

export const dkSentences: Sentence[] = ${JSON.stringify(sentences, null, 2)};

export const dkAnnotations: Annotation[] = ${JSON.stringify(annotations, null, 2)};

export const dkOverrides: Record<string, Record<string, [string, string, string]>> = {};
`;

writeFileSync("src/data/library/dich-kinh.ts", ts, "utf-8");

// Print work entry info
console.log(`\nWork entry to add:`);
console.log(JSON.stringify({
  id: WORK_ID,
  titleViet: "Dịch Kinh",
  titleHan: "易經",
  authorId: "auth_dich_kinh",
  chapterCount: chapters.length,
  characterCount: totalChars,
  language: "han_van",
  isPublished: true,
  iconChar: "易",
  progressPercent: 0,
  tagIds: ["t1", "t7", "t11", "t19"],
}));

// Print author entry
console.log(`\nAuthor entry to add:`);
console.log(JSON.stringify({
  id: "auth_dich_kinh",
  nameViet: "Phục Hy / Văn Vương / Chu Công / Khổng Tử",
  nameHan: "伏羲／文王／周公／孔子",
  era: "~3000 TCN – 479 TCN",
  dynasty: "Thượng cổ – Xuân Thu",
  bio: "Dịch Kinh được cho là khởi nguồn từ Phục Hy vẽ bát quái, Chu Văn Vương viết quái từ, Chu Công viết hào từ, Khổng Tử viết Thập Dực (chú giải).",
}));
