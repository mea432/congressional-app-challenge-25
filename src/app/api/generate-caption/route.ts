import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required.' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a social app called UnReel. Your task is to generate a short, fun, and friendly caption for a selfie that friends have taken together during a meetup. The caption should be one sentence and celebrate their friendship or the activity they're doing. Be creative and positive. Do not include hashtags."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write a caption for this photo."
            },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    const caption = completion.choices[0]?.message?.content?.trim();
    if (caption) {
      return NextResponse.json({ caption });
    } else {
      return NextResponse.json({ error: 'Failed to generate caption.' }, { status: 500 });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
