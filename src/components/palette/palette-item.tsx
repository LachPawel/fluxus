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
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '10px 14px', 
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        cursor: 'grab',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 200ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
      }}
    >
      <div style={{ padding: 8, borderRadius: 8, backgroundColor: colors.bgHex }}>
        <DynamicIcon name={node.icon} style={{ width: 16, height: 16, color: colors.textHex }} />
      </div>
      <span style={{ fontSize: 14, flex: 1, fontWeight: 500, color: '#334155' }}>{node.label}</span>
      <LucideIcons.ArrowRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
    </div>
  );
}
