"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/library", label: "Kệ Sách", icon: "📚" },
  { href: "/dictionary", label: "Từ Điển", icon: "字", isHan: true },
  { href: "/profile", label: "Cá Nhân", icon: "👤" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-bg-primary border-r border-border-main h-screen sticky top-0 shrink-0">
      <div className="p-5">
        <h1 className="font-han-kai text-xl font-bold text-text-primary">漢典</h1>
        <p className="text-[11px] text-text-faint mt-0.5">Hán Văn · Hán Nôm</p>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors ${
                active
                  ? "bg-bg-secondary text-accent-dark font-medium"
                  : "text-text-muted hover:bg-bg-subtle"
              }`}
            >
              <span className={`text-base ${item.isHan ? "font-han-kai font-bold" : ""}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
