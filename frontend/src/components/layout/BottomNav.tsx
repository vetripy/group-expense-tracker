"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Groups", icon: "👥" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-safe dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex items-center justify-around py-3">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                isActive
                  ? "text-primary-600 dark:text-primary-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
