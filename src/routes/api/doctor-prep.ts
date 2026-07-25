import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject } from "ai";
import { z } from "zod";

const MAX_CONTEXT_CHARS = 8000;

const inputSchema = z.object({
  context: z.string().min(1).max(MAX_CONTEXT_CHARS),
  profile: z
    .object({
      name: z.string().max(40).optional(),
      age: z.number().int().min(8).max(100).optional(),
    })
    .optional(),
});

function errorJson(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/doctor-prep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const started = Date.now();
        let status = 200;
        try {
          let raw: unknown;
          try {
            raw = await request.json();
          } catch {
            status = 400;
            return errorJson(400, "Invalid request body.");
          }
          const parsed = inputSchema.safeParse(raw);
          if (!parsed.success) {
            status = 400;
            return errorJson(400, "Please provide a valid history context.");
          }
          const { context, profile } = parsed.data;

          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            status = 503;
            return errorJson(
              503,
              "Nari's AI engine isn't configured. Please contact the developer.",
            );
          }

          const groq = createOpenAICompatible({
            name: "groq",
            baseURL: "https://api.groq.com/openai/v1",
            apiKey,
          });

          let systemPrompt = `You are Nari, an empathetic Indian gynaecological AI assistant acting as an older sister ("Didi").
The user is asking if they should visit a doctor based on their historical cycle and symptom logs. All dates and times are India Standard Time (Asia/Kolkata, UTC+5:30). Use Indian conventions (DD Mon YYYY). Mirror the user's language: warm Hinglish if she writes Hinglish, Hindi if she writes Hindi, English if she writes English.`;

          if (profile?.name) {
            systemPrompt += `\nThe user's name is ${profile.name}${
              profile.age ? ` and she is ${profile.age} years old` : ""
            }. Address her by her name naturally in your response, and adjust your tone to be age-appropriate.`;
          }

          systemPrompt += `
Review the provided patient history. Act as a medical triage system:
- If the logs show normal, healthy variations (e.g. slight cycle shifts, mild day-1 cramps, low risk scores), set shouldVisitDoctor to false. Comfort them using warm Hinglish phrases (like 'yaar', 'take care').
- If the logs show high risk indicators (e.g., severe pain preventing activities, extremely irregular cycles, very heavy bleeding causing fatigue), set shouldVisitDoctor to true. Explain your concern kindly but firmly, and provide a list of standard clinical tests and questions they should ask. DO NOT diagnose them (e.g. say "potential iron deficiency" not "you have anaemia").

Patient History Context:
${context}
`;

          const result = await generateObject({
            model: groq("llama-3.3-70b-versatile"),
            system: systemPrompt,
            prompt: "Analyze my history and tell me if I should visit a doctor.",
            abortSignal: request.signal,
            schema: z.object({
              shouldVisitDoctor: z.boolean(),
              message: z.string().describe("A beautiful, empathetic response from Didi."),
              tests: z
                .array(z.object({ text: z.string(), reason: z.string() }))
                .optional(),
              questions: z
                .array(z.object({ text: z.string(), reason: z.string() }))
                .optional(),
            }),
          });

          return new Response(JSON.stringify(result.object), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          status = 500;
          const msg = err instanceof Error ? err.message : "Unexpected error";
          console.error("[doctor-prep error]", msg);
          const userMsg = /429|rate/i.test(msg)
            ? "Nari's AI provider is busy. Try again in a minute."
            : /401|403|api key/i.test(msg)
              ? "Nari's AI credentials aren't valid. Please contact the developer."
              : /402|quota|billing/i.test(msg)
                ? "Nari's AI quota is exhausted for now. Please try again later."
                : "Nari couldn't generate this right now. Please try again.";
          return errorJson(status, userMsg);
        } finally {
          console.log(`[doctor-prep] status=${status} latency=${Date.now() - started}ms`);
        }
      },
    },
  },
});
