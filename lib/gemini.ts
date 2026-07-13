import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { AIAnalysisResult, ReflectionResult } from "@/types";

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
].filter((model): model is string => Boolean(model));

const analysisSchema = z.object({
  summary: z.string(),
  emotion: z.string(),
  keywords: z.array(z.string()),
  futureLetter: z.string(),
  possibleObstacles: z.array(z.string()).optional(),
  motivationAdvice: z.string().optional(),
  advice: z.string().optional(),
  obstacles: z.array(z.string()).optional(),
});

const reflectionSchema = z.object({
  growth: z.string(),
  achievements: z.array(z.string()),
  missedGoals: z.array(z.string()),
  suggestions: z.array(z.string()),
  encouragement: z.string(),
});

function getApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }
  return key;
}

function getModel(modelName: string) {
  const genAI = new GoogleGenerativeAI(getApiKey());
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}

function getRetryDelayMs(error: unknown, attempt: number) {
  const message = error instanceof Error ? error.message : "";
  const match = message.match(/retry in ([\d.]+)s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 500;
  }
  return Math.pow(2, attempt) * 1000;
}

function formatGeminiError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown Gemini error";

  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return "Gemini free quota exceeded. Wait 1–2 minutes and retry, or create a new API key at https://aistudio.google.com/apikey and set GEMINI_MODEL=gemini-2.5-flash-lite";
  }

  if (message.includes("404") || message.includes("not found")) {
    return "Gemini model not available. Set GEMINI_MODEL=gemini-2.5-flash-lite in .env.local";
  }

  if (message.includes("API key not valid") || message.includes("401")) {
    return "Invalid GEMINI_API_KEY. Create one at https://aistudio.google.com/apikey (starts with AIza...)";
  }

  return message;
}

async function generateWithModels(prompt: string, parse: (raw: string) => unknown) {
  let lastError: unknown;

  for (const modelName of DEFAULT_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = getModel(modelName);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parse(text);
      } catch (error) {
        lastError = error;
        const isLastAttempt = attempt === 2;
        const isLastModel = modelName === DEFAULT_MODELS[DEFAULT_MODELS.length - 1];

        if (!isLastAttempt) {
          await new Promise((resolve) =>
            setTimeout(resolve, getRetryDelayMs(error, attempt))
          );
          continue;
        }

        if (!isLastModel) {
          break;
        }
      }
    }
  }

  throw new Error(formatGeminiError(lastError));
}

function parseAnalysis(raw: string): AIAnalysisResult {
  const parsed = analysisSchema.parse(JSON.parse(raw));
  return {
    summary: parsed.summary,
    emotion: parsed.emotion,
    keywords: parsed.keywords,
    futureLetter: parsed.futureLetter,
    advice: parsed.motivationAdvice ?? parsed.advice ?? "",
    obstacles: parsed.possibleObstacles ?? parsed.obstacles ?? [],
  };
}

export async function analyzeGoal(input: {
  title: string;
  category: string;
  goal: string;
}): Promise<AIAnalysisResult> {
  const prompt = `You are an AI that helps preserve people's passion.

Analyze the following goal.

Return ONLY JSON.

Fields:
- summary
- emotion
- keywords
- futureLetter
- possibleObstacles
- motivationAdvice

Tone:
- warm
- encouraging
- emotional
- never exaggerate

Title: ${input.title}
Category: ${input.category}
Goal: ${input.goal}`;

  return generateWithModels(prompt, (raw) => parseAnalysis(raw as string)) as Promise<AIAnalysisResult>;
}

export async function analyzeReflection(input: {
  title: string;
  category: string;
  goal: string;
  reflection: string;
  priorReflections?: string[];
}): Promise<ReflectionResult> {
  const prior =
    input.priorReflections && input.priorReflections.length > 0
      ? `\nPrior reflections:\n${input.priorReflections.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
      : "";

  const prompt = `You are an AI that helps people reflect on their personal growth journey.

Compare their original goal with their current reflection.

Return ONLY JSON with these fields:
- growth (string)
- achievements (array of strings)
- missedGoals (array of strings)
- suggestions (array of strings)
- encouragement (string)

Tone: warm, honest, encouraging, never exaggerate.

Original title: ${input.title}
Category: ${input.category}
Original goal: ${input.goal}
Current reflection: ${input.reflection}${prior}`;

  return generateWithModels(
    prompt,
    (raw) => reflectionSchema.parse(JSON.parse(raw as string))
  ) as Promise<ReflectionResult>;
}
