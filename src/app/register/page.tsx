"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, displayName);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md sticker-container p-8">
        <h1 className="mb-6 text-center text-3xl font-black text-white drop-shadow-sm uppercase tracking-wide">
          Criar Conta
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-950/40 p-3.5 text-red-200 text-xs font-bold shadow-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-black text-white mb-1.5 uppercase tracking-wider">
              Nome de Treinador
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-sticker w-full"
              placeholder="Treinador Ash"
              required
            />
          </div>

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
              Escolha uma Senha
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
            className="w-full btn-sticker btn-sticker-yellow mt-3 py-3 text-sm"
          >
            {loading ? "Registrando..." : "Registrar Nova Conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-[var(--muted)]">
          Já possui cadastro?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline ml-1">
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
