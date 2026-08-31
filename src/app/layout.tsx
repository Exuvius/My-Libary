import type { Metadata } from "next";
import { fontLinks } from "@/lib/fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hán Điển — Từ điển & Thư viện Hán Văn",
  description: "Ứng dụng Từ điển & Thư viện Hán Văn – Hán Nôm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {fontLinks.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
