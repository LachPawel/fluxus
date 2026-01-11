import * as LucideIcons from 'lucide-react';
import type { NodeDefinition } from '@/lib/nodes';
import { CATEGORY_COLORS } from '@/lib/nodes';
import { DynamicIcon } from '@/components/common/dynamic-icon';

interface NodeHeaderProps {
  label: string;
  icon: string;
  category: NodeDefinition['category'];
}

export function NodeHeader({ label, icon, category }: NodeHeaderProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <div 
      style={{ 
        padding: '12px 16px', 
        gap: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: colors.bgHex,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div 
          style={{ 
            padding: 6,
            borderRadius: 8,
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <DynamicIcon name={icon} style={{ width: 18, height: 18, color: colors.textHex }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.textHex }}>{label}</span>
      </div>
      <button 
        style={{ 
          padding: 4, 
          borderRadius: 4, 
          cursor: 'pointer', 
          border: 'none', 
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LucideIcons.MoreHorizontal style={{ width: 16, height: 16, color: '#94a3b8' }} />
      </button>
    </div>
  );
}
