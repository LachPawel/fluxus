import { getNodeDef, CATEGORY_COLORS } from '@/lib/nodes';
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

  const color = CATEGORY_COLORS[nodeDef.category];
  return color ? color.accent : '#71717a';
}
