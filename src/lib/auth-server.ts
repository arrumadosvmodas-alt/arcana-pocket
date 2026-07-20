import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with anon key for getting user
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (uses service role key for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Get user from request (preferred method)
export async function getUserFromRequest(req: NextRequest): Promise<string | undefined> {
  try {
    // Try to get from Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const userId = getUserIdFromJWT(token);
      if (userId) return userId;
    }

    // Fallback: get from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-auth-token")?.value;
    if (authToken) {
      return getUserIdFromJWT(authToken);
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

// Decode JWT directly (simpler for route handlers)
export function getUserIdFromJWT(token: string): string | undefined {
  if (!token) return undefined;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;

    // Decode JWT payload (second part)
    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    return decoded.sub; // 'sub' is the user ID in Supabase JWTs
  } catch (error) {
    return undefined;
  }
}

// Legacy: get user ID from auth header string
export function getUserIdFromAuthHeader(authHeader?: string): string | undefined {
  if (!authHeader) return undefined;
  const token = authHeader.replace("Bearer ", "");
  return getUserIdFromJWT(token);
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-auth-token")?.value;

    if (!authToken) {
      return null;
    }

    const { data, error } = await supabaseAdmin.auth.admin.getUserById(
      authToken.split(".")[0]
    );

    if (error || !data.user) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(
        authToken
      );

      if (userError || !userData.user) {
        return null;
      }

      return userData.user.id;
    }

    return data.user.id;
  } catch (error) {
    return null;
  }
}
