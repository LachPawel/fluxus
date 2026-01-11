import { getNodeDef } from '@/lib/nodes';
import type { Node } from '@xyflow/react';
import type { FlowNodeData } from '@/lib/nodes';

export function calculateHandlePosition(index: number, total: number): number {
  if (total === 1) return 50;
  const spacing = 60 / (total + 1);
  return 20 + spacing * (index + 1);
}

export function getMiniMapNodeColor(node: Node<FlowNodeData>): string {
  const nodeDef = getNodeDef(node.data.type);
  if (!nodeDef) return '#71717a'; // zinc-500

  const categoryColorMap: Record<string, string> = {
    trigger: '#22c55e', // green-500
    action: '#3b82f6', // blue-500
    condition: '#f59e0b', // amber-500
    utility: '#a855f7', // purple-500
  };

  return categoryColorMap[nodeDef.category] || '#71717a';
}
