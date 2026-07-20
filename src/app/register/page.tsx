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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Registre-se</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Nome de Jogador
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] py-2 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Já tem conta?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
