import { revalidatePath } from "next/cache";
import { REVALIDATE_ALL_ROUTES } from "@/lib/app-routes";

export function revalidateAll() {
  for (const route of REVALIDATE_ALL_ROUTES) {
    revalidatePath(route);
  }
}

export function handleServerError(error: unknown, context: string): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Server Action] ${context}:`, error);
  return { success: false, error: message };
}
