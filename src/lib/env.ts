export function checkEnv() {
  if (typeof window !== "undefined") return;

  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  if (!process.env.NVIDIA_API_KEY && !process.env.OPENAI_API_KEY) {
    warnings.push("NVIDIA_API_KEY is not set — AI chat will fail");
  }

  if (missing.length > 0) {
    console.error(`OmniLife OS: Missing required env vars: ${missing.join(", ")}`);
  }

  for (const w of warnings) {
    console.warn(`OmniLife OS: ${w}`);
  }
}
