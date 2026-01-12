import { type Edge } from '@xyflow/react';
import { type FlowNode } from '@/lib/nodes';

export const initialNodes: FlowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger_keyword',
    position: { x: 250, y: 100 },
    data: {
      type: 'trigger_keyword',
      label: 'Keyword Trigger',
      keywords: 'hello, hi, start',
      matchType: 'contains',
    },
  },
  {
    id: 'action-1',
    type: 'action_message',
    position: { x: 250, y: 400 },
    data: {
      type: 'action_message',
      label: 'Send Message',
      message: 'Hello! Welcome to our WhatsApp bot. How can I help you today?',
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'e-trigger-action',
    source: 'trigger-1',
    sourceHandle: 'triggered',
    target: 'action-1',
    targetHandle: 'in',
  },
];
