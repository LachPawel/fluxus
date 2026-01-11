import * as LucideIcons from 'lucide-react';
import type { NodeDefinition } from '@/lib/nodes';
import { CATEGORY_COLORS } from '@/lib/nodes';
import { DynamicIcon } from '@/components/common/dynamic-icon';

interface PaletteItemProps {
  node: NodeDefinition;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

export function PaletteItem({ node, onDragStart }: PaletteItemProps) {
  const colors = CATEGORY_COLORS[node.category];

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', node.type);
    event.dataTransfer.effectAllowed = 'move';
    onDragStart?.(event, node.type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title={node.description}
      className="flex items-center gap-3 px-3.5 py-2.5 w-full bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab transition-all duration-200 hover:bg-slate-50"
    >
      <div className={`p-2 rounded-lg ${colors.bg}`}>
        <DynamicIcon name={node.icon} className={`w-4 h-4 ${colors.text}`} />
      </div>
      <span className="text-sm flex-1 font-medium text-slate-700">{node.label}</span>
      <LucideIcons.ArrowRight className="w-4 h-4 text-slate-400" />
    </div>
  );
}
