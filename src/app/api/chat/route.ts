import { streamText, type ModelMessage } from "ai";
import { aiModel } from "@/lib/ai-provider";
import { omniTools } from "@/lib/ai-tools";

export const maxDuration = 120;

type ChatPart = { type: string; text?: string };
type ChatMessage = {
  id?: unknown;
  parts?: ChatPart[];
  [key: string]: unknown;
};

function toModelMessage(msg: ChatMessage): ModelMessage {
  const { parts } = msg;
  const rest = { ...msg };
  delete rest.id;
  delete rest.parts;

  if (parts) {
    const textParts = parts.filter((p) => p.type === "text");
    const nonTextParts = parts.filter((p) => p.type !== "text");
    if (nonTextParts.length === 0 && textParts.length === 1) {
      return { ...rest, content: textParts[0].text } as ModelMessage;
    }
    return { ...rest, content: parts } as ModelMessage;
  }
  return rest as ModelMessage;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const messages = typeof body === "object" && body !== null && "messages" in body
      ? (body as { messages?: unknown }).messages
      : undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const converted = messages.map((message) => toModelMessage(message as ChatMessage));

    const systemPrompt = `You are the AI assistant for OmniLife OS, a personal operating system that manages a user's entire life including learning, finances, projects, and calendar.

YOUR ROLE:
- You are autonomous and action-oriented. When the user asks you to do something, USE THE TOOLS to do it immediately. Do not ask for confirmation unless the action is destructive.
- When the user makes a statement that implies an action (e.g., "I paid my rent"), interpret it as a command and execute it.
- Always summarize what you did at the end in a friendly, concise way.

MULTI-TOOL EXECUTION:
- A single user message may require multiple tool calls. Execute all of them.
- Example: "I studied React for 2 hours and finished the hooks assignment" requires BOTH logStudySession AND toggleAssignment.

CONTEXT AWARENESS:
- Before making changes, use the READ tools (getLearningPaths, getBills, getIncomeEntries) to understand the user's current state.
- When referencing items by name (e.g., "my Spanish course"), first fetch the data to find the correct ID.

DATE HANDLING:
- Today's date is June 27, 2026. When the user says "next Monday" or "tomorrow", calculate the actual ISO date.
- Always use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) for dates.

RESPONSE STYLE:
- After executing tools, provide a brief, organized summary with emoji indicators:
  ✅ for completed actions
  ⏱️ for time logged
  💰 for financial changes
  📅 for calendar events
  📚 for learning updates
- Keep responses short. The user is busy.`;

    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: converted,
      tools: omniTools,
    });

    return result.toTextStreamResponse({ status: 200 });
  } catch (error) {
    console.error("[Chat API]", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
