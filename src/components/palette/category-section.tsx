import * as LucideIcons from 'lucide-react';
import type { NodeCategory, NodeDefinition } from '@/lib/nodes';
import { CATEGORY_COLORS } from '@/lib/nodes';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/utils/constants';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { PaletteItem } from './palette-item';

interface CategorySectionProps {
  category: NodeCategory;
  nodes: NodeDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

export function CategorySection({
  category,
  nodes,
  isExpanded,
  onToggle,
  onDragStart,
}: CategorySectionProps) {
  const colors = CATEGORY_COLORS[category];

  if (nodes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Category Toggle Button */}
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3.5 py-3 rounded-lg border-none cursor-pointer transition-all duration-200 ${isExpanded ? 'bg-slate-100' : 'bg-white hover:bg-slate-100'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <DynamicIcon
              name={CATEGORY_ICONS[category]}
              className={`w-4 h-4 ${colors.text}`}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700">{CATEGORY_LABELS[category]}</span>
        </div>
        <LucideIcons.ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Node Items */}
      {isExpanded && (
        <div className="flex flex-col gap-2 pl-2">
          {nodes.map((node) => (
            <PaletteItem key={node.type} node={node} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  );
}
