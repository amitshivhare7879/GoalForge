import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { goalName, duration, category } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY not found. Using simulated AI response.");
      return NextResponse.json({
        curve: simulateDifficultyCurve(goalName, duration),
        persona: `AI Pathfinder analyzed '${goalName}'. The curve starts with 'Soft Heat' (intensity 20) and ramps up to 'The Sledge' (intensity 100) by the end of the ${duration} period.`,
        isSimulated: true
      });
    }

    const prompt = `
      You are the GoalForge AI Pathfinder. 
      Analyze this goal: "${goalName}"
      Duration: ${duration}
      Category: ${category}

      Generate a scientifically designed 'Difficulty Curve' for this commitment. 
      The goal of the curve is to prevent burnout at the start and maximize discipline by the end.
      
      Requirements:
      1. Provide an array of exactly 8 data points representing the progression intensity (0-100).
      2. The first point should be 'Soft Heat' (low intensity to build habit).
      3. The final point should be 'The Sledge' (peak intensity).
      4. Provide a brief 1-sentence persona analysis of why this curve was chosen.

      Respond STRICTLY in JSON format with these keys:
      {
        "curve": [{"day": "Week 1", "intensity": 20}, ...],
        "persona": "..."
      }
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const result = JSON.parse(content);

    return NextResponse.json({ ...result, isSimulated: false });

  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze goal" }, { status: 500 });
  }
}

function simulateDifficultyCurve(name: string, duration: string) {
  // A slightly smart simulator that varies based on the goal name length
  const seed = name.length % 5;
  return [
    { day: 'Week 1', intensity: 15 + seed },
    { day: 'Week 2', intensity: 25 + seed * 2 },
    { day: 'Week 3', intensity: 35 + seed },
    { day: 'Week 4', intensity: 50 + seed * 3 },
    { day: 'Week 5', intensity: 65 },
    { day: 'Week 6', intensity: 80 },
    { day: 'Week 7', intensity: 90 },
    { day: 'Week 8', intensity: 100 },
  ];
}
