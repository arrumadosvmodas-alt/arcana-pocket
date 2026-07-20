import { supabase } from "./supabase";

export async function authFetch(url: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const headers = {
    ...options.headers,
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
  
  return fetch(url, { ...options, headers });
}
