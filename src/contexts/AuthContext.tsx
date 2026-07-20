"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!email || !password || !displayName) {
      throw new Error("Email, senha e nome são obrigatórios");
    }

    // Check if email already exists
    try {
      const { data: { user: existingUser }, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (!signInError && existingUser) {
        throw new Error("Este email já está registrado. Faça login em vez de registrar novamente.");
      }
    } catch (err: any) {
      if (err.message && err.message.includes("já está registrado")) {
        throw err;
      }
      // Continue if user doesn't exist (expected)
    }

    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered")) {
        throw new Error("Este email já está registrado");
      }
      throw error;
    }

    // Wait a moment for user to be created
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create profile after signup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profileRes = await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, displayName, email }),
      });

      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.error || "Erro ao criar perfil");
      }
    } else {
      throw new Error("Erro ao criar conta");
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
