import * as LucideIcons from 'lucide-react';
import {
  getNodeDef,
  CATEGORY_COLORS,
  type FlowNodeData,
} from '@/lib/nodes';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { FormField } from './editor/form-fields';

// =============================================================================
// Types
// =============================================================================

interface NodeEditorProps {
  nodeId: string;
  nodeType: string;
  data: FlowNodeData;
  onUpdate: (id: string, data: Partial<FlowNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// =============================================================================
// Node Editor Component
// =============================================================================

export function NodeEditor({
  nodeId,
  nodeType,
  data,
  onUpdate,
  onDelete,
  onClose,
}: NodeEditorProps) {
  const nodeDef = getNodeDef(nodeType);

  if (!nodeDef) {
    return (
      <div 
        style={{ 
          width: 320, 
          backgroundColor: '#ffffff', 
          borderLeft: '1px solid #e2e8f0', 
          padding: 16 
        }}
      >
        <p style={{ color: '#dc2626', fontSize: 14 }}>Unknown node type: {nodeType}</p>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[nodeDef.category];

  const handleFieldChange = (name: string, value: unknown) => {
    onUpdate(nodeId, { [name]: value });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      onDelete(nodeId);
    }
  };

  return (
    <div 
      style={{ 
        width: 340, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 20px',
          backgroundColor: colors.bgHex,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 8, backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <DynamicIcon name={nodeDef.icon} style={{ width: 18, height: 18, color: colors.textHex }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.textHex }}>{data.label}</span>
        </div>
        <button
          onClick={onClose}
          title="Close"
          style={{ 
            padding: 6, 
            borderRadius: 6, 
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LucideIcons.X style={{ width: 18, height: 18, color: '#94a3b8' }} />
        </button>
      </div>

      {/* Description */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#64748b', margin: 0 }}>{nodeDef.description}</p>
      </div>

      {/* Form Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {nodeDef.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={data[field.name]}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          style={{
             width: '100%',
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             gap: 8, 
             padding: '12px 16px', 
             fontSize: 14,
             fontWeight: 500,
             color: '#ffffff',
             backgroundColor: '#2563eb',
             border: 'none',
             borderRadius: 8,
             cursor: 'pointer',
             transition: 'background-color 200ms'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          style={{
             width: '100%',
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             gap: 8, 
             padding: '12px 16px', 
             fontSize: 14,
             fontWeight: 500,
             color: '#dc2626',
             backgroundColor: '#fef2f2',
             border: '1px solid #fecaca',
             borderRadius: 8,
             cursor: 'pointer',
             transition: 'background-color 200ms'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
        >
          <LucideIcons.Trash2 style={{ width: 16, height: 16 }} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
