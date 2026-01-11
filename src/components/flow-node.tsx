import { memo, type ComponentType } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import {
  getNodeDef,
  getAllNodes,
  CATEGORY_COLORS,
  type FlowNodeData,
} from '@/lib/nodes';
import { calculateHandlePosition } from '@/utils/flow-utils';
import { NodeHeader } from './flow/node-header';
import { NodeBody } from './flow/node-body';

// =============================================================================
// Flow Node Component
// =============================================================================

function FlowNodeComponent({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  const nodeDef = getNodeDef(data.type);

  if (!nodeDef) {
    return (
      <div style={{ 
        borderRadius: 12, 
        backgroundColor: '#fef2f2', 
        border: '2px solid #fca5a5', 
        padding: 16, 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
      }}>
        <span style={{ color: '#dc2626', fontSize: 14 }}>Unknown node: {data.type}</span>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[nodeDef.category];
  const hasInputs = nodeDef.inputs.length > 0;

  return (
    <div
      style={{
        minWidth: 240,
        maxWidth: 300,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        border: `2px solid ${selected ? '#3b82f6' : colors.borderHex}`,
        boxShadow: selected 
          ? '0 0 0 4px #eff6ff, 0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 200ms ease',
        position: 'relative'
      }}
    >
      {/* Input Handles */}
      {hasInputs &&
        nodeDef.inputs.map((input, index) => {
          const topPosition = calculateHandlePosition(index, nodeDef.inputs.length);
          return (
            <Handle
              key={input.id}
              type="target"
              position={Position.Left}
              id={input.id}
              style={{ 
                top: `${topPosition}%`,
                width: 12,
                height: 12,
                backgroundColor: '#ffffff',
                border: '2px solid #cbd5e1',
                zIndex: 10
              }}
              title={input.label}
            />
          );
        })}

      <NodeHeader 
        label={data.label} 
        icon={nodeDef.icon} 
        category={nodeDef.category} 
      />

      <NodeBody 
        nodeDef={nodeDef} 
        data={data} 
      />

      {/* Output Handles - Single */}
      {nodeDef.outputs.length === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          id={nodeDef.outputs[0].id}
          style={{ 
            top: '50%',
            right: -6, // React Flow default offset is usually fine but let's be explicit if needed
            width: 12,
            height: 12,
            backgroundColor: '#ffffff',
            border: '2px solid #cbd5e1',
            zIndex: 10
          }}
          title={nodeDef.outputs[0].label}
        />
      )}

      {/* Multiple outputs with labels */}
      {nodeDef.outputs.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 16px 16px' }}>
          {nodeDef.outputs.map((output) => (
            <div key={output.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, color: '#64748b', marginRight: 12, fontWeight: 500 }}>{output.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: -22,
                  width: 12,
                  height: 12,
                  backgroundColor: '#ffffff',
                  border: '2px solid #cbd5e1',
                  zIndex: 10,
                  transform: 'translateY(-50%)'
                }}
                title={output.label}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Memoized Export
// =============================================================================

export const FlowNode = memo(FlowNodeComponent);

// =============================================================================
// Node Types Factory
// =============================================================================

/**
 * Creates a Record mapping all registered node types to the FlowNode component
 * Use this to pass to ReactFlow's nodeTypes prop
 */
export function createNodeTypes(): Record<string, ComponentType<NodeProps<Node<FlowNodeData>>>> {
  const nodeTypes: Record<string, ComponentType<NodeProps<Node<FlowNodeData>>>> = {};

  for (const node of getAllNodes()) {
    nodeTypes[node.type] = FlowNode;
  }

  return nodeTypes;
}
