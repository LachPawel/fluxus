import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { getNodesByCategory, getAllCategories, type NodeCategory } from '@/lib/nodes';
import { CategorySection } from './palette/category-section';

// =============================================================================
// Types
// =============================================================================

interface NodePaletteProps {
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

// =============================================================================
// Node Palette Component
// =============================================================================

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const categories = getAllCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['trigger', 'action']),
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
    <div className="flex flex-col w-[280px] h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
        <div className="p-2.5 rounded-lg bg-blue-50">
          <LucideIcons.Workflow className="w-[22px] h-[22px] text-blue-600" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 mb-0.5">Fluxus</h1>
          <p className="text-xs text-slate-500 m-0">Flow Builder</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200 group focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <LucideIcons.Search className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Category Sections */}
      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4 pb-5">
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
    </div>
  );
}
