import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL_ID = "deepseek-ai/DeepSeek-V3";

export async function POST(req: NextRequest) {
  try {
    const { goalName, duration, category } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn('HUGGINGFACE_API_KEY not found. Using simulated AI response.');
      return NextResponse.json({
        curve: simulateDifficultyCurve(goalName, duration),
        persona: `AI Pathfinder analyzed '${goalName}'. The curve starts with 'Soft Heat' (intensity 20) and ramps up to 'The Sledge' (intensity 100) by the end of the ${duration} period.`,
        isSimulated: true
      });
    }

    const prompt = `You are the GoalForge Discipline Architect.
Analyze the commitment: "${goalName}"
Duration: ${duration}
Category: ${category}

Construct a scientific 'Difficulty Curve' based on high-performance psychology and habit-building principles.

Phases to implement in the curve:
1. Soft Heat (Initial 15% of duration): Intensity 15-25%. Focus on forming the neural pathways without triggers for burnout.
2. Increasing Warmth (Next 25%): Intensity 25-50%. Stepping outside the comfort zone.
3. The Hammer Phase (Next 40%): Intensity 50-85%. Peak struggle where true transformation occurs.
4. The Quench (Final 20%): Intensity 85-100%. Maximum intensity culminating in the final day.

Output Requirements:
- Total Data Points: 8 points representing equal intervals across the ${duration}.
- Legend: Each point must have a unique "label" indicating the phase (e.g., "Phase 1: Soft Heat").
- Analysis: A professional, slightly intense Forge AI persona analysis (max 2 sentences).

Respond ONLY with valid JSON in this exact schema, with no markdown formatting or extra text:
{
  "curve": [{"label": "Phase 1: Soft Heat", "intensity": 20}],
  "persona": "Forge AI Evaluation: ..."
}`;

    const response = await hf.chatCompletion({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds in JSON format.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '';

    // Clean potential markdown blocks from response just in case
    const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(jsonString);

    return NextResponse.json({ ...result, isSimulated: false });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze goal' }, { status: 500 });
  }
}

function simulateDifficultyCurve(name: string, duration: string) {
  // A slightly smart simulator that varies based on the goal name length
  const seed = name.length % 5;
  return [
    { label: 'Phase 1: Soft Heat', intensity: 15 + seed },
    { label: 'Phase 2: Soft Heat', intensity: 20 + seed },
    { label: 'Phase 3: Warmup', intensity: 35 + seed * 2 },
    { label: 'Phase 4: Increasing Warmth', intensity: 45 + seed },
    { label: 'Phase 5: The Hammer Phase', intensity: 65 + seed * 3 },
    { label: 'Phase 6: Peak Intensity', intensity: 80 },
    { label: 'Phase 7: Peak Intensity', intensity: 90 },
    { label: 'Phase 8: The Quench', intensity: 100 },
  ];
}
