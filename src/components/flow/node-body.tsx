import type { NodeDefinition, FlowNodeData } from '@/lib/nodes';
import { CATEGORY_COLORS } from '@/lib/nodes';
import { getSelectLabel } from '@/utils/ui-utils';

interface NodeBodyProps {
  nodeDef: NodeDefinition;
  data: FlowNodeData;
}

export function NodeBody({ nodeDef, data }: NodeBodyProps) {
  const colors = CATEGORY_COLORS[nodeDef.category];

  return (
    <div style={{ padding: '16px 16px 20px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {nodeDef.fields.slice(0, 2).map((field) => {
          const value = data[field.name];
          if (!value) return null;
          
          return (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label 
                style={{ 
                  fontSize: 11, 
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  fontWeight: 500
                }}
              >
                {field.label}
              </label>
              {field.type === 'select' ? (
                <div 
                  style={{ 
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#334155' }}>
                    {getSelectLabel(field, value)}
                  </span>
                </div>
              ) : field.name === 'keywords' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {String(value).split(',').map((keyword, i) => (
                    <span
                      key={i}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        fontSize: 13,
                        fontWeight: 500,
                        backgroundColor: colors.bgHex,
                        color: colors.textHex
                      }}
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p 
                  style={{ 
                    fontSize: 14, 
                    lineHeight: 1.5,
                    color: '#475569',
                    margin: 0
                  }}
                >
                  {String(value).slice(0, 80)}{String(value).length > 80 ? '...' : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
