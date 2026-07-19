"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/packs", label: "Pacotes" },
  { href: "/shop", label: "Loja" },
  { href: "/missions", label: "Missões" },
  { href: "/collection", label: "Coleção" },
  { href: "/decks", label: "Decks" },
  { href: "/battle", label: "Batalha" },
  { href: "/admin", label: "🔧" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)]" />
          Arcana Pocket
        </Link>
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-2">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
