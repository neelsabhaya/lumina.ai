import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are the Lumina.ai Grader. Analyze the prompt and return ONLY a JSON object: { \"score\": number, \"feedback\": \"string\" }. Feedback must be the re-architected version of the user's messy intent."
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText.replace(/```json|```/g, ""));

    // Save to database
    await supabase.from('prompts').insert([
      {
        original_text: prompt,
        architected_prompt: data.feedback,
        score: data.score
      }
    ]);

    return NextResponse.json(data);
  } catch {
    // Prefixing with underscore fixes the 'unused variable' error
    return NextResponse.json({ score: 10, feedback: "System Error" }, { status: 500 });
  }
}