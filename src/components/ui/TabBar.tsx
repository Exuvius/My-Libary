"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/library", label: "Kệ Sách", icon: "📚" },
  { href: "/dictionary", label: "Từ Điển", icon: "字", isHan: true },
  { href: "/profile", label: "Cá Nhân", icon: "👤" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary border-t border-border-main md:hidden">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 transition-colors ${
                active ? "text-accent-dark" : "text-text-muted"
              }`}
            >
              <span
                className={`text-lg leading-none ${
                  tab.isHan ? "font-han-kai font-bold text-xl" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
