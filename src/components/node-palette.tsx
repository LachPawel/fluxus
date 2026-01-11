import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  getNodesByCategory,
  getAllCategories,
  type NodeCategory,
} from '@/lib/nodes';
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
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: 280, 
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div style={{ padding: 10, borderRadius: 8, backgroundColor: '#eff6ff' }}>
          <LucideIcons.Workflow style={{ width: 22, height: 22, color: '#2563eb' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 16, marginBottom: 2, fontWeight: 700, color: '#1e293b' }}>Fluxus</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Flow Builder</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 20px' }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}
        >
          <LucideIcons.Search style={{ width: 18, height: 18, color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            style={{ 
              flex: 1, 
              fontSize: 14, 
              border: 'none', 
              backgroundColor: 'transparent', 
              outline: 'none', 
              color: '#334155' 
            }}
          />
        </div>
      </div>

      {/* Category Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
