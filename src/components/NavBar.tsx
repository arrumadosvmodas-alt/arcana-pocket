"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session) {
      authFetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.role === "ADMIN") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        })
        .catch(() => {
          setIsAdmin(false);
        });
    } else {
      setIsAdmin(false);
    }
  }, [session]);

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

  const visibleLinks = LINKS.filter((link) => {
    if (link.href === "/admin") return isAdmin;
    return true;
  });

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c0f2e]/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display tracking-wider text-white text-lg">
          <span 
            className="inline-block h-5 w-5 rounded-md border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          />
          <span className="font-black uppercase text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Arcana Pocket</span>
        </Link>
        
        {session ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold text-[var(--muted)]">{session.user.email}</span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="btn-sticker btn-sticker-sec py-1 px-3.5 text-xs shadow-none border-white/10 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
            >
              {signingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-sticker py-1 px-3.5 text-xs shadow-none border-white/10 bg-cyan-950/50 hover:bg-cyan-900/60 rounded-lg text-cyan-400 cursor-pointer"
          >
            Login
          </Link>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
        {visibleLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap font-bold text-xs px-3.5 py-1.5 rounded-lg border transition-all ${
                active
                  ? "bg-cyan-500/10 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                  : "bg-white/5 text-slate-400 border-transparent hover:text-white hover:bg-white/10 hover:border-white/10"
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
