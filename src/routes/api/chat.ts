import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/health/context";

type ChatBody = {
  messages?: UIMessage[];
  healthContext?: string;
  profile?: { name?: string; age?: number };
};

// --- Simple in-memory sliding-window rate limit ------------------------------
// Serverless instances are per-region and short-lived; this is a soft guard,
// not a strict quota. Millions of unique IPs won't blow memory because entries
// self-expire.
const RATE_MAX_PER_MIN = 20;
const RATE_MAX_PER_DAY = 200;
const MIN_MS = 60_000;
const DAY_MS = 86_400_000;
const rateBuckets = new Map<string, number[]>();

function rateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const arr = rateBuckets.get(ip) ?? [];
  // Drop anything older than 24h.
  const fresh = arr.filter((t) => now - t < DAY_MS);
  const lastMin = fresh.filter((t) => now - t < MIN_MS);
  if (lastMin.length >= RATE_MAX_PER_MIN) {
    return { ok: false, retryAfter: 60 };
  }
  if (fresh.length >= RATE_MAX_PER_DAY) {
    return { ok: false, retryAfter: Math.ceil((DAY_MS - (now - fresh[0])) / 1000) };
  }
  fresh.push(now);
  rateBuckets.set(ip, fresh);
  // Best-effort GC.
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) {
      if (!v.length || now - v[v.length - 1] > DAY_MS) rateBuckets.delete(k);
    }
  }
  return { ok: true };
}

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for") ?? "";
  const first = xff.split(",")[0]?.trim();
  return first || request.headers.get("cf-connecting-ip") || "anon";
}

// Cap message count & each message length to keep tokens predictable.
const MAX_MESSAGES = 30;
const MAX_MSG_CHARS = 4000;
const MAX_CONTEXT_CHARS = 6000;

function sanitizeMessages(messages: UIMessage[]): UIMessage[] {
  const trimmed = messages.slice(-MAX_MESSAGES);
  return trimmed.map((m) => ({
    ...m,
    parts: m.parts.map((p) => {
      if (p.type !== "text") return p;
      const text = typeof p.text === "string" ? p.text : "";
      return { ...p, text: text.length > MAX_MSG_CHARS ? text.slice(0, MAX_MSG_CHARS) + "…" : text };
    }),
  }));
}

function errorJson(status: number, message: string, extra?: Record<string, unknown>) {
  return new Response(
    JSON.stringify({ error: message, ...(extra ?? {}) }),
    { status, headers: { "content-type": "application/json" } },
  );
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const started = Date.now();
        let status = 200;
        try {
          const ip = clientIp(request);
          const rl = rateLimit(ip);
          if (!rl.ok) {
            status = 429;
            return new Response(
              JSON.stringify({
                error:
                  "Nari is getting a lot of messages right now. Please wait a minute and try again — thoda ruk ke bhejein.",
              }),
              {
                status: 429,
                headers: {
                  "content-type": "application/json",
                  "retry-after": String(rl.retryAfter),
                },
              },
            );
          }

          let body: ChatBody;
          try {
            body = (await request.json()) as ChatBody;
          } catch {
            status = 400;
            return errorJson(400, "Invalid request body.");
          }

          const rawMessages = body.messages;
          if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
            status = 400;
            return errorJson(400, "Please send a message to Nari.");
          }
          const messages = sanitizeMessages(rawMessages);

          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            status = 503;
            return errorJson(
              503,
              "Nari's AI engine isn't configured yet. The developer needs to add a GROQ_API_KEY environment variable.",
            );
          }

          const groq = createOpenAICompatible({
            name: "groq",
            baseURL: "https://api.groq.com/openai/v1",
            apiKey,
          });

          const ctx =
            typeof body.healthContext === "string"
              ? body.healthContext.slice(0, MAX_CONTEXT_CHARS)
              : "";

          let system = ctx
            ? `${SYSTEM_PROMPT}\n\n=== HEALTH CONTEXT (user's own data) ===\n${ctx}\n=== END CONTEXT ===`
            : SYSTEM_PROMPT;

          system += `\n\nTIME & LOCALE: All dates and times refer to India Standard Time (Asia/Kolkata, UTC+5:30). Use Indian conventions (DD Mon YYYY, 12-hour with am/pm). Mirror the user's language mix — if she writes in Hinglish, reply in warm Hinglish; if she writes in Hindi, reply in Hindi; if in English, reply in English. Never switch languages on her.`;

          const name = body.profile?.name?.trim().slice(0, 40);
          const age = typeof body.profile?.age === "number" ? body.profile.age : undefined;
          if (name) {
            system += `\n\nIMPORTANT: You are currently talking to ${name}${
              age ? `, who is ${age} years old` : ""
            }. Address her by her name naturally.${
              age && age <= 17
                ? " Use an extra-protective, elder-sister tone appropriate for a teenager."
                : ""
            }`;
          }

          const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            system,
            messages: convertToModelMessages(messages),
            temperature: 0.6,
            abortSignal: request.signal,
          });

          return result.toUIMessageStreamResponse({
            onError: (err) => {
              const msg = err instanceof Error ? err.message : String(err);
              console.error("[chat stream error]", msg);
              if (/429|rate/i.test(msg))
                return "Nari's AI provider is rate-limiting right now. Try again in a moment.";
              if (/401|403|api key/i.test(msg))
                return "Nari's AI credentials aren't valid. Please contact the developer.";
              if (/402|quota|billing/i.test(msg))
                return "Nari's AI quota is exhausted for now. Please try again later.";
              return "Nari stumbled mid-thought. Please try that again.";
            },
          });
        } catch (err) {
          status = 500;
          const message = err instanceof Error ? err.message : "Unexpected error";
          console.error("[chat handler error]", message);
          return errorJson(500, "Nari hit an unexpected error. Please try again.");
        } finally {
          console.log(`[chat] status=${status} latency=${Date.now() - started}ms`);
        }
      },
    },
  },
});
