import { supabase } from "./supabase";

export async function getProfileIdFromRequest(req: Request): Promise<string> {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      
      if (user) {
        return user.id;
      }
    }
  } catch (err) {
    console.error("Error getting profile ID from JWT:", err);
  }

  // Fallback to custom header
  const userIdHeader = req.headers.get("x-user-id");
  if (userIdHeader) {
    return userIdHeader;
  }

  return "local-player";
}
