import { revalidatePath } from "next/cache";

export function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/finances");
  revalidatePath("/learning");
  revalidatePath("/projects");
}

export function handleServerError(error: unknown, context: string): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Server Action] ${context}:`, error);
  return { success: false, error: message };
}
