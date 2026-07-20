import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client (uses service role key for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
      // Fallback: try to get from Supabase JWT
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

// Alternative: decode JWT directly (simpler for route handlers)
export function getUserIdFromAuthHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  try {
    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode JWT payload (second part)
    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    return decoded.sub; // 'sub' is the user ID in Supabase JWTs
  } catch (error) {
    return null;
  }
}
