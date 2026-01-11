import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, tool, type UIMessage } from 'ai';
import {
  addNodeSchema,
  updateNodeSchema,
  deleteNodeSchema,
  connectNodesSchema,
  disconnectNodesSchema,
  clearFlowSchema,
  generateFlowSystemPrompt,
} from '@/lib/ai-flow-tools';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, flowState }: { messages: UIMessage[]; flowState?: unknown } = await req.json();

  // Include current flow state in the system prompt if provided
  const systemPrompt =
    generateFlowSystemPrompt() +
    (flowState
      ? `\n\n## Current Flow State\n\`\`\`json\n${JSON.stringify(flowState, null, 2)}\n\`\`\``
      : '\n\n## Current Flow State\nNo flow state provided. Use getFlowState to see the current canvas.');

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      addNode: tool({
        description: 'Add a new node to the flow canvas',
        inputSchema: addNodeSchema,
        execute: async (params) => {
          // Return the params - actual execution happens on the client
          return { success: true, action: 'addNode', params };
        },
      }),
      updateNode: tool({
        description: "Update an existing node's configuration",
        inputSchema: updateNodeSchema,
        execute: async (params) => {
          return { success: true, action: 'updateNode', params };
        },
      }),
      deleteNode: tool({
        description: 'Delete a node from the flow',
        inputSchema: deleteNodeSchema,
        execute: async (params) => {
          return { success: true, action: 'deleteNode', params };
        },
      }),
      connectNodes: tool({
        description: 'Connect two nodes with an edge',
        inputSchema: connectNodesSchema,
        execute: async (params) => {
          return { success: true, action: 'connectNodes', params };
        },
      }),
      disconnectNodes: tool({
        description: 'Remove edge connections',
        inputSchema: disconnectNodesSchema,
        execute: async (params) => {
          return { success: true, action: 'disconnectNodes', params };
        },
      }),
      clearFlow: tool({
        description: 'Clear all nodes and edges from the canvas',
        inputSchema: clearFlowSchema,
        execute: async (params) => {
          if (!params.confirm) {
            return { success: false, error: 'Must confirm to clear flow' };
          }
          return { success: true, action: 'clearFlow', params };
        },
      }),
      getFlowState: tool({
        description: 'Get the current flow state',
        inputSchema: z.object({}),
        execute: async () => {
          // The flow state is passed in the request, return it
          return {
            success: true,
            action: 'getFlowState',
            flowState: flowState ?? { nodes: [], edges: [] },
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
