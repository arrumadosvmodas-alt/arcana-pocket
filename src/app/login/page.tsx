"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md sticker-container p-8">
        <h1 className="mb-6 text-center text-3xl font-black text-white drop-shadow-sm uppercase tracking-wide">
          Entrar no Jogo
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-950/40 p-3.5 text-red-200 text-xs font-bold shadow-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-xs font-black text-white mb-1.5 uppercase tracking-wider">
              Endereço de Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-sticker w-full"
              placeholder="treinador@email.com"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-black text-white mb-1.5 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-sticker w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-sticker mt-2 py-3 text-sm"
          >
            {loading ? "Entrando..." : "Entrar no Pocket"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-[var(--muted)]">
          Ainda não tem uma conta?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline ml-1">
            Registre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
