import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const user = await db.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

export const getMockUser = getCurrentUser;
