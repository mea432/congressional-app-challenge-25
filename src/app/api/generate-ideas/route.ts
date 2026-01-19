import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant for an app called UnReel, which is a 'reverse social media' app that encourages users to meet up in person. Your goal is to suggest fun, simple, and low-cost activities for two friends to do together in the real world. Provide 3 distinct ideas. Do not number them; instead, separate each idea with a newline."
        },
        {
          role: "user",
          content: "Suggest a meetup idea."
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const ideas = completion.choices[0]?.message?.content?.trim();
    if (ideas) {
      return NextResponse.json({ ideas: ideas.split('\n').filter(idea => idea.trim() !== '') });
    } else {
      return NextResponse.json({ error: 'Failed to generate ideas.' }, { status: 500 });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
