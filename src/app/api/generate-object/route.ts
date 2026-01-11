import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Example schema - customize based on your needs
const flowNodeSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      description: z.string().optional(),
    }),
  ),
  connections: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  const { prompt, schema } = await req.json();

  // Use provided schema or default to flowNodeSchema
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: schema ? z.object(schema) : flowNodeSchema,
    prompt,
  });

  return Response.json({
    object: result.object,
    usage: result.usage,
    finishReason: result.finishReason,
  });
}
