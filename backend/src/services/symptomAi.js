import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

// ✅ Lazy client creation so the server can start even if env loads later.
// Routes already validate OPENAI_API_KEY before calling these functions.
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const L = z.object({ en: z.string(), hi: z.string(), te: z.string() });

export const SymptomSchema = z.object({
  urgency: z.enum(["emergency", "same_day", "routine"]),
  department: z.enum([
    "General Medicine",
    "ENT",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "Ophthalmology",
    "Dental",
    "Cardiology",
    "Neurology",
    "Emergency",
  ]),
  possible_causes: z.array(L).max(5),
  red_flags: z.array(L).max(8),
  self_care: z.array(L).max(8),
  next_steps: z.array(L).max(8),
  questions_for_doctor: z.array(L).max(8),
  summary: L,
  disclaimer: L,
});

function baseInstructions() {
  return `You are an AI symptom checker for a government hospital appointment website.
You are NOT a doctor. Do NOT provide a diagnosis.
Your job is triage: summarize symptoms, list possible causes (non-final), suggest the right department, and determine urgency.
Always include red flags. If red flags appear, urgency must be emergency.

Output must follow the JSON schema.

Return all user-facing strings in 3 languages: English (en), Hindi (hi), Telugu (te).
Use simple, patient-friendly language.

If input is empty or nonsense, return routine urgency, General Medicine department, and ask for more details.
`; 
}

export async function runSymptomCheckText({ text }) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = getClient();

  const response = await client.responses.parse({
    model,
    input: [
      { role: "system", content: baseInstructions() },
      {
        role: "user",
        content: [
          { type: "input_text", text: `Patient symptoms (free text):\n${text || ""}` },
        ],
      },
    ],
    text: {
      format: zodTextFormat(SymptomSchema, "symptom_check"),
    },
  });

  return response.output_parsed;
}

export async function runSymptomCheckImage({ text, imageMime, imageBase64 }) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const dataUrl = `data:${imageMime || "image/jpeg"};base64,${imageBase64}`;
  const client = getClient();

  const response = await client.responses.parse({
    model,
    input: [
      { role: "system", content: baseInstructions() },
      {
        role: "user",
        content: [
          { type: "input_text", text: `Patient symptom description (optional):\n${text || ""}\n\nAnalyze the image carefully. If image is not medically useful, say so and rely on text.` },
          { type: "input_image", image_url: dataUrl },
        ],
      },
    ],
    text: {
      format: zodTextFormat(SymptomSchema, "symptom_check"),
    },
  });

  return response.output_parsed;
}
