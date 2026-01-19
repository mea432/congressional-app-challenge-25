import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { friendName, meetups } = await req.json();

    if (!friendName || !meetups) {
      return NextResponse.json({ error: 'friendName and meetups are required.' }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let history = "Here are the last 20 meetups:\n";
    if (meetups.length > 0) {
      history += meetups
        .map((m: { caption: string; timestamp: number }) => {
          const date = new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `- ${date}: ${m.caption || "No caption"}`;
        })
        .join('\n');
    } else {
      history = "There are no past meetups on record.";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful and creative friend, suggesting activities for a user and their friend, ${friendName}. Your goal is to foster their real-world friendship.
- Today's date is ${today}.
- Analyze their past meetups to find patterns (e.g., "You seem to enjoy hiking," "You often grab coffee").
- Suggest three unique and actionable ideas based on this history.
- If they do something often, suggest a new twist on it or point out it's been a while.
- If they have no history, suggest some simple, classic first-time meetup ideas.
- Be encouraging and friendly.
- IMPORTANT: Provide only the 3 ideas, each separated by a newline. Do not use numbering, dashes, or any other formatting.`
        },
        {
          role: "user",
          content: `Here is my meetup history with ${friendName}:\n${history}\n\nBased on our history, what should we do next?`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const ideas = completion.choices[0]?.message?.content?.trim();
    if (ideas) {
      return NextResponse.json({ ideas: ideas.split('\n').filter(idea => idea.trim() !== '') });
    } else {
      return NextResponse.json({ error: 'Failed to generate ideas.' }, { status: 500 });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
