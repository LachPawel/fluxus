import { openai } from '@ai-sdk/openai';
import { generateText, type CoreMessage } from 'ai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system }: { messages: CoreMessage[]; system?: string } = await req.json();

  const result = await generateText({
    model: openai('gpt-4o'),
    system: system ?? 'You are a helpful assistant.',
    messages,
  });

  return Response.json({
    text: result.text,
    usage: result.usage,
    finishReason: result.finishReason,
  });
}
