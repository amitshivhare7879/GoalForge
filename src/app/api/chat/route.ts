import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const SYSTEM_PROMPT = `You are the GoalForge AI Pathfinder. You are an elite discipline architect.

MISSION:
Turn a user's ambition into a rigorous, day-by-day protocol.

CONVERSATION FLOW:
1. GREET: Accept the goal once.
2. MISSING INFO: If the user hasn't specified DURATION (days) or STAKE (money/₹), ask for them.
3. PROPOSAL: Explain the strategy in human-readable, inspiring terms. Do NOT show JSON yet.
4. JSON FINALIZATION: Once they agree, output a readable summary, then the JSON block hidden inside triple backticks.

STRICT DATA RULES:
- NO ELLIPSIS: Never use "..." or "[...]" in the tasks or curve arrays.
- DAILY TASKS: Output an entry for EVERY single day in the 'tasks' array (Day 1 to End).
- CURVE: Output exactly 8 intensity markers in the 'curve' array.

JSON FORMAT (Hidden from user):
\`\`\`json
{
  "is_final": true,
  "title": "Precise Title",
  "duration_days": 30,
  "category": "Discipline",
  "stake": "₹500",
  "curve": [
    {"day": 1, "intensity": 20},
    {"day": 5, "intensity": 35},
    {"day": 10, "intensity": 50},
    {"day": 15, "intensity": 65},
    {"day": 20, "intensity": 75},
    {"day": 25, "intensity": 85},
    {"day": 28, "intensity": 95},
    {"day": 30, "intensity": 100}
  ],
  "tasks": [
    {"day": 1, "task": "Initial session..."},
    {"day": 2, "task": "..."},
    ... continue for every day
  ]
}
\`\`\`

ALWAYS wrap the JSON in triple backticks.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn("HUGGINGFACE_API_KEY not found.");
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const payloadMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const response = await hf.chatCompletion({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: payloadMessages,
      max_tokens: 3072,
    });

    const content = response.choices[0].message.content || '';

    return NextResponse.json({ text: content });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to generate chat response" }, { status: 500 });
  }
}
