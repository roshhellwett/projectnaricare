import { createFileRoute } from "@tanstack/react-router";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject } from "ai";
import { z } from "zod";

export const Route = createFileRoute("/api/doctor-prep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { context, profile } = body;

          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 503 });
          }

          const groq = createOpenAICompatible({
            name: "groq",
            baseURL: "https://api.groq.com/openai/v1",
            apiKey,
          });

          let systemPrompt = `You are Nari, an empathetic Indian gynaecological AI assistant acting as an older sister ("Didi"). 
The user is asking if they should visit a doctor based on their historical cycle and symptom logs.`;

          if (profile) {
            systemPrompt += `\nThe user's name is ${profile.name} and she is ${profile.age} years old. Address her by her name naturally in your response, and adjust your tone to be age-appropriate.`;
          }

          systemPrompt += `
Review the provided patient history. Act as a medical triage system:
- If the logs show normal, healthy variations (e.g. slight cycle shifts, mild day-1 cramps, low risk scores), set shouldVisitDoctor to false. Comfort them using warm Hinglish phrases (like 'yaar', 'take care'). 
- If the logs show high risk indicators (e.g., severe pain preventing activities, extremely irregular cycles, very heavy bleeding causing fatigue), set shouldVisitDoctor to true. Explain your concern kindly but firmly, and provide a list of standard clinical tests and questions they should ask. DO NOT diagnose them (e.g. say "potential iron deficiency" not "you have anaemia").

You must respond in strictly formatted JSON containing exactly these keys:
{
  "shouldVisitDoctor": boolean,
  "message": "your empathetic response here",
  "tests": [ { "text": "...", "reason": "..." } ],
  "questions": [ { "text": "...", "reason": "..." } ]
}

Patient History Context:
${context}
`;

          const result = await generateObject({
            model: groq("llama-3.3-70b-versatile"),
            system: systemPrompt,
            prompt: "Analyze my history and tell me if I should visit a doctor.",
            schema: z.object({
              shouldVisitDoctor: z.boolean(),
              message: z.string().describe("A beautiful, empathetic response from Didi explaining the decision."),
              tests: z.array(z.object({
                text: z.string().describe("Name of the clinical test"),
                reason: z.string().describe("Reason for suggesting this test based on symptoms")
              })).optional().describe("Only provide if shouldVisitDoctor is true"),
              questions: z.array(z.object({
                text: z.string().describe("Question to ask the doctor"),
                reason: z.string().describe("Reason for this question")
              })).optional().describe("Only provide if shouldVisitDoctor is true")
            })
          });

          return new Response(JSON.stringify(result.object), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error: any) {
          console.error("Doctor prep AI error:", error);
          return new Response(JSON.stringify({ error: error.message || "Failed to generate triage" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
