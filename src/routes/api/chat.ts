import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/health/context";

type ChatBody = {
  messages?: UIMessage[];
  healthContext?: string;
  profile?: { name: string; age: number };
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ChatBody;
          const messages = body.messages;
          if (!Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({
                error:
                  "Nari's AI engine isn't configured yet. The developer needs to add a GROQ_API_KEY environment variable.",
              }),
              { status: 503, headers: { "content-type": "application/json" } },
            );
          }

          const groq = createOpenAICompatible({
            name: "groq",
            baseURL: "https://api.groq.com/openai/v1",
            apiKey,
          });

          let system = body.healthContext
            ? `${SYSTEM_PROMPT}\n\n=== HEALTH CONTEXT (user's own data) ===\n${body.healthContext}\n=== END CONTEXT ===`
            : SYSTEM_PROMPT;
            
          if (body.profile) {
            system += `\n\nIMPORTANT: You are currently talking to ${body.profile.name}, who is ${body.profile.age} years old. Address her by her name naturally. Adjust your tone to be age-appropriate (e.g. more like a protective elder sister if she is a teenager).`;
          }

          const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            system,
            messages: convertToModelMessages(messages),
            temperature: 0.6,
          });

          return result.toUIMessageStreamResponse();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unexpected error";
          return new Response(
            JSON.stringify({ error: `Nari hit an error: ${message}. Please try again.` }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
