import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  getNodesByCategory,
  getAllCategories,
  CATEGORY_COLORS,
  type NodeCategory,
  type NodeDefinition,
} from '@/lib/nodes';

// =============================================================================
// Types
// =============================================================================

interface NodePaletteProps {
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

interface DynamicIconProps {
  name: string;
  className?: string;
}

// =============================================================================
// Dynamic Icon Component
// =============================================================================

function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as
    | LucideIcons.LucideIcon
    | undefined;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} />;
  }

  return <IconComponent className={className} />;
}

// =============================================================================
// Category Labels
// =============================================================================

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  trigger: 'Triggers',
  action: 'Actions',
  condition: 'Conditions',
  utility: 'Utilities',
};

const CATEGORY_ICONS: Record<NodeCategory, string> = {
  trigger: 'Zap',
  action: 'Play',
  condition: 'GitBranch',
  utility: 'Wrench',
};

// =============================================================================
// Node Palette Item
// =============================================================================

interface PaletteItemProps {
  node: NodeDefinition;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

function PaletteItem({ node, onDragStart }: PaletteItemProps) {
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
      className={`
        flex items-center justify-center w-10 h-10 rounded-lg cursor-grab
        transition-all duration-200 hover:scale-110 active:cursor-grabbing
        ${colors.bg} ${colors.border} border
      `}
      title={`${node.label}\n${node.description}`}
    >
      <DynamicIcon name={node.icon} className={`w-5 h-5 ${colors.text}`} />
    </div>
  );
}

// =============================================================================
// Category Section
// =============================================================================

interface CategorySectionProps {
  category: NodeCategory;
  nodes: NodeDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

function CategorySection({
  category,
  nodes,
  isExpanded,
  onToggle,
  onDragStart,
}: CategorySectionProps) {
  const colors = CATEGORY_COLORS[category];

  if (nodes.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Category Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg
          transition-all duration-200 hover:bg-zinc-700
          ${isExpanded ? colors.bg : 'bg-zinc-800'}
        `}
        title={CATEGORY_LABELS[category]}
      >
        <DynamicIcon
          name={CATEGORY_ICONS[category]}
          className={`w-5 h-5 ${isExpanded ? colors.text : 'text-zinc-400'}`}
        />
      </button>

      {/* Expanded Node Items */}
      {isExpanded && (
        <div className="flex flex-col items-center gap-2 mt-2 pb-2">
          {nodes.map((node) => (
            <PaletteItem key={node.type} node={node} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Node Palette Component
// =============================================================================

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const categories = getAllCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['trigger', 'action'])
  );

  const toggleCategory = (category: NodeCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-1 w-14 bg-zinc-900 border-r border-zinc-800 py-3 px-2">
      {/* Logo/Title */}
      <div className="flex items-center justify-center w-10 h-10 mb-2" title="Fluxus">
        <LucideIcons.Workflow className="w-6 h-6 text-green-500" />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-zinc-700 mb-2" />

      {/* Category Sections */}
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          nodes={getNodesByCategory(category)}
          isExpanded={expandedCategories.has(category)}
          onToggle={() => toggleCategory(category)}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
}
