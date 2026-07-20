"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/manual", label: "Como Jogar 📖" },
  { href: "/packs", label: "Pacotes" },
  { href: "/shop", label: "Loja" },
  { href: "/missions", label: "Missões" },
  { href: "/collection", label: "Coleção" },
  { href: "/decks", label: "Decks" },
  { href: "/battle", label: "PvE" },
  { href: "/pvp", label: "⚔️ PvP" },
  { href: "/ranking", label: "🏆" },
  { href: "/admin", label: "🔧" },
];

export function NavBar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b-4 border-black bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-white text-lg">
          <span 
            className="inline-block h-6 w-6 rounded-lg border-2 border-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          />
          <span className="drop-shadow-sm font-black">Arcana Pocket</span>
        </Link>
        
        {session ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold text-[var(--muted)]">{session.user.email}</span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="btn-sticker btn-sticker-sec py-1 px-3 text-xs"
              style={{ boxShadow: '0 2px 0 var(--border-dark)', border: '2px solid var(--border-dark)' }}
            >
              {signingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-sticker py-1 px-3 text-xs"
            style={{ boxShadow: '0 2px 0 var(--border-dark)', border: '2px solid var(--border-dark)' }}
          >
            Login
          </Link>
        )}
      </div>
      
      {/* Navigation Links as Sticker Pills */}
      <nav className="mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-4 pb-2.5 scrollbar-none">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap font-bold text-xs px-3.5 py-1.5 rounded-full border-2 border-black transition-all ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-white hover:border-[var(--accent)]"
              }`}
              style={{
                boxShadow: active ? '0 2px 0 var(--border-dark)' : 'none',
                transform: active ? 'translateY(-1px)' : 'none'
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
