# 漢典 Hán Điển

**Từ điển & Thư viện Hán văn cổ điển dành cho người Việt**

Hán Điển là ứng dụng tra cứu từ điển Hán văn cổ điển và đọc các tác phẩm kinh điển Trung Hoa, được thiết kế đặc biệt cho người Việt học Hán Nôm. Ứng dụng cung cấp đầy đủ âm Hán Việt, Pinyin, nghĩa tiếng Việt và hỗ trợ cả phồn thể lẫn giản thể.

---

## Tính năng chính

### 1. Từ điển (字典)

- **4.042 chữ Hán** với đầy đủ thông tin: âm Hán Việt, Pinyin, bộ thủ, số nét, nghĩa tiếng Việt
- **214 bộ thủ** theo hệ thống Khang Hy
- **Từ ghép & thành ngữ** — tra cứu các cụm từ Hán văn thường gặp
- **Từ chuyên ngành** — thuật ngữ Phật giáo, Nho giáo, y học cổ truyền...
- **4 tab phân loại**: Đơn tự, Từ ghép, Thành ngữ, Chuyên ngành
- **Tìm kiếm** theo chữ Hán, âm Hán Việt hoặc Pinyin
- **Lọc theo bộ thủ** và số nét
- **Trang chi tiết chữ Hán**: tất cả âm đọc, nghĩa, từ ghép liên quan, trích dẫn trong kho sách
- **Thứ tự nét** (Stroke Order) — hoạt hình minh họa cách viết từng chữ

### 2. Kệ sách (書架)

- **24 tác phẩm kinh điển** bao gồm:
  - **Kinh điển Nho giáo**: Tam Tự Kinh, Luận Ngữ, Thiên Tự Văn, Bách Gia Tính
  - **Đạo gia**: Đạo Đức Kinh (đầy đủ 81 chương)
  - **Thơ Đường — Tống**: Lý Bạch, Đỗ Phủ, Bạch Cư Dị, Tô Đông Pha, Vương Duy, Lý Thanh Chiếu, và nhiều thi nhân khác
- **Phân loại** theo Loại hình, Thể loại, Thời kỳ, Ngôn ngữ
- **Tìm kiếm** tác phẩm theo tên Hán hoặc tên Việt
- **Trang chi tiết tác phẩm**: giới thiệu, mục lục chương, thông tin tác giả

### 3. Chế độ đọc (閱讀)

- **Hiển thị chú thích** (ruby text):
  - Âm Hán Việt phía trên mỗi chữ
  - Âm Pinyin phía trên mỗi chữ
  - Bật/tắt từng loại riêng biệt
- **Dịch nghĩa** — bản dịch tiếng Việt từng câu
- **Chú giải** — giải thích ý nghĩa sâu của từng đoạn
- **Bình luận** — nhận xét, phân tích từ người đọc
- **Tra từ nhanh** — bấm vào bất kỳ chữ nào để xem nghĩa, âm đọc, từ loại; link đến trang chi tiết trong từ điển
- **Lưu từ cá nhân** — thêm chữ vào từ điển cá nhân ngay từ tooltip
- **Đánh dấu chữ chưa biết** — tô sáng các chữ chưa có trong từ điển và từ điển cá nhân

### 4. Tùy chỉnh hiển thị

- **3 font chữ Hán**:
  - 明體 Minh thể (Noto Serif SC) — font mặc định, trang trọng
  - 楷體 Khải thể (LXGW WenKai TC) — phong cách viết tay
  - 黑體 Hắc thể (Noto Sans SC) — font sans-serif hiện đại
- **Chuyển đổi Phồn thể ⇄ Giản thể** — toàn bộ nội dung hiển thị theo tùy chọn
- **Căn lề**: Trái / Giữa / Phải
- **Giao diện**: Sáng / Tối / Theo hệ thống
- **Bảng điều khiển FAB** — nút tròn góc phải dưới, mở panel cài đặt nhanh khi đang đọc

### 5. Thư viện cá nhân (個人書架)

- **Tạo tuyển tập** — nhóm các văn bản theo chủ đề (VD: "Thơ Lý Bạch", "Bài tập", "Tam Quốc Diễn Nghĩa")
- **Thêm văn bản** — dán nội dung Hán văn vào tuyển tập, chia chương tự động
- **Đọc văn bản cá nhân** — cùng trải nghiệm đọc như kệ sách chính: ruby text, tra từ, font, highlight
- **Mục lục chương** — duyệt nhanh giữa các chương trong tuyển tập
- **Lưu vị trí đọc** — tự động ghi nhớ đoạn đang đọc
- **Lưu trữ ngoại tuyến** — dữ liệu lưu trong IndexedDB, không cần kết nối mạng

### 6. Từ điển cá nhân (個人字典)

- **Thêm từ mới** — lưu chữ/từ ghép/thành ngữ với âm Hán Việt, Pinyin, nghĩa, ghi chú
- **Sửa & xóa** — quản lý toàn bộ từ vựng cá nhân
- **Tích hợp khi đọc** — từ cá nhân hiển thị trong tooltip khi đọc bất kỳ sách nào
- **Export JSON** — xuất dữ liệu để sao lưu hoặc merge vào từ điển chính
- **CLI merge** — script `scripts/merge-personal-dict.mjs` để nhập từ cá nhân vào static data

### 7. Ứng dụng di động (Android)

- **APK Android** — build bằng Capacitor, chạy offline hoàn toàn
- **Trải nghiệm native** — giao diện tối ưu cho màn hình cảm ứng
- **Offline-first** — toàn bộ từ điển và kệ sách đóng gói trong app

---

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router, Static Export) |
| UI | React 19, Tailwind CSS v4 |
| State | Zustand (persist middleware) |
| Lưu trữ cá nhân | IndexedDB (collections, documents, dict entries) |
| Font chữ Hán | Google Fonts (Noto Serif SC, Noto Sans SC, LXGW WenKai TC) |
| Hoạt hình nét | hanzi-writer |
| Dark mode | next-themes |
| Mobile | Capacitor (Android) |
| Ngôn ngữ | TypeScript |

---

## Cài đặt & Chạy

### Web (Development)

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`.

### Build Static

```bash
npm run build
```

Output tĩnh nằm trong thư mục `out/`.

### Build APK Android

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK debug nằm tại `android/app/build/outputs/apk/debug/app-debug.apk`.

> **Yêu cầu**: Android SDK đã cài đặt. Tạo file `android/local.properties` với nội dung `sdk.dir=<đường dẫn Android SDK>` nếu chưa có.

---

## Cấu trúc dữ liệu

```
src/data/
├── characters.ts      # 4.042 chữ Hán (CharacterFull[])
├── entries.ts         # Từ ghép, thành ngữ, chuyên ngành (Entry[])
├── radicals.ts        # 214 bộ thủ Khang Hy
├── decompositions.ts  # Cấu trúc tách chữ
├── simp-trad.ts       # Bảng chuyển đổi Giản ⇄ Phồn
├── index.ts           # Re-export & helper functions
└── library/
    ├── works.ts       # 24 tác phẩm
    ├── authors.ts     # Thông tin tác giả
    ├── annotations.ts # Chú giải
    ├── dao-duc-kinh.ts
    ├── luan-ngu.ts
    ├── tam-tu-kinh.ts
    ├── thien-tu-van.ts
    ├── bach-gia-tinh.ts
    └── poems.ts       # Thơ Đường — Tống
```

## Cấu trúc ứng dụng

```
src/app/
├── (browse)/
│   ├── library/           # Kệ sách — danh sách & chi tiết tác phẩm
│   ├── dictionary/        # Từ điển — tra cứu chữ & từ
│   ├── profile/           # Trang cá nhân & cài đặt
│   └── personal/
│       ├── collection/    # Xem tuyển tập cá nhân
│       └── dictionary/    # Quản lý từ điển cá nhân
├── read/[workId]/         # Chế độ đọc (kệ sách)
└── personal/read/         # Chế độ đọc (văn bản cá nhân)
```

---

## Giấy phép

Dự án cá nhân — chưa công bố giấy phép.
