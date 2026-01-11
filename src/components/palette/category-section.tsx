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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Category Toggle Button */}
      <button
        onClick={onToggle}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%', 
          padding: '12px 14px',
          backgroundColor: isExpanded ? '#f1f5f9' : '#ffffff',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 200ms',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) e.currentTarget.style.backgroundColor = '#f1f5f9';
        }}
        onMouseLeave={(e) => {
           if (!isExpanded) e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 8, backgroundColor: colors.bgHex }}>
            <DynamicIcon
              name={CATEGORY_ICONS[category]}
              style={{ width: 16, height: 16, color: colors.textHex }}
            />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{CATEGORY_LABELS[category]}</span>
        </div>
        <LucideIcons.ChevronDown 
          style={{ 
            width: 16, 
            height: 16, 
            color: '#94a3b8',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms'
          }}
        />
      </button>

      {/* Expanded Node Items */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, paddingLeft: 8 }}>
          {nodes.map((node) => (
            <PaletteItem key={node.type} node={node} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  );
}
