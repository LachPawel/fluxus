import { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  getAllCategories,
  getNodesByCategory,
  type NodeCategory,
  type NodeDefinition,
  CATEGORY_COLORS,
} from '@/lib/nodes';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/utils/constants';
import { DynamicIcon } from '@/components/common/dynamic-icon';

interface NodePickerProps {
  position: { x: number; y: number };
  onSelect: (nodeType: string) => void;
  onClose: () => void;
}

export function NodePicker({ position, onSelect, onClose }: NodePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<NodeCategory | 'all'>('all');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Filter nodes
  const categories = getAllCategories();
  const getFilteredNodes = () => {
    let nodes: NodeDefinition[] = [];

    if (activeCategory === 'all') {
      categories.forEach((cat) => {
        nodes = [...nodes, ...getNodesByCategory(cat)];
      });
    } else {
      nodes = getNodesByCategory(activeCategory);
    }

    if (searchTerm) {
      nodes = nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return nodes;
  };

  const filteredNodes = getFilteredNodes();

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 w-[300px] bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Header with Search */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <LucideIcons.Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Categories Tab (Icon only for compactness) */}
      <div className="flex px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          title="All"
          className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
            activeCategory === 'all'
              ? 'bg-slate-100 text-slate-800'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <LucideIcons.LayoutGrid className="w-4 h-4" />
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            title={CATEGORY_LABELS[cat]}
            className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
              activeCategory === cat
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <DynamicIcon name={CATEGORY_ICONS[cat]} className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] p-2">
        <div className="flex flex-col gap-1">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node) => {
              const colors = CATEGORY_COLORS[node.category];
              return (
                <button
                  key={node.type}
                  onClick={() => onSelect(node.type)}
                  className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md hover:bg-slate-50 transition-colors group"
                >
                  <div className={`p-1.5 rounded-md ${colors.bg}`}>
                    <DynamicIcon name={node.icon} className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                      {node.label}
                    </div>
                    {/* <div className="text-xs text-slate-500 truncate">{node.description}</div> */}
                  </div>
                  <LucideIcons.Plus className="w-4 h-4 text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">No actions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
