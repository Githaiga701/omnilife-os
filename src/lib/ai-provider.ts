import { createOpenAI } from "@ai-sdk/openai";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

function getNvidiaApiKey(): string {
  const key = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn("OmniLife OS: No NVIDIA_API_KEY or OPENAI_API_KEY set — AI chat will fail");
  }
  return key || "";
}

export const nvidia = createOpenAI({
  baseURL: NVIDIA_BASE_URL,
  apiKey: getNvidiaApiKey(),
});

export const aiModel = nvidia.chat("z-ai/glm-5.1");
