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
      className={`relative min-w-[240px] max-w-[300px] rounded-xl bg-white border-2 transition-all duration-200 ${
        selected 
          ? 'border-blue-500 shadow-[0_0_0_4px_#eff6ff,0_10px_15px_-3px_rgba(0,0,0,0.1)]' 
          : `${colors.border} shadow-md`
      }`}
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
              style={{ top: `${topPosition}%` }}
              className="!w-3 !h-3 !bg-white !border-2 !border-slate-300 !z-10"
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
          style={{ top: '50%' }}
          className="!w-3 !h-3 !bg-white !border-2 !border-slate-300 !z-10 !-right-[8px]" // Adjusted right position via class or style? ReactFlow handles have default styles.
          title={nodeDef.outputs[0].label}
        />
      )}

      {/* Multiple outputs with labels */}
      {nodeDef.outputs.length > 1 && (
        <div className="flex flex-col gap-2 px-4 pb-4">
          {nodeDef.outputs.map((output) => (
            <div key={output.id} className="relative flex items-center justify-end">
              <span className="text-xs text-slate-500 mr-3 font-medium">{output.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                className="!absolute !-right-[24px] !w-3 !h-3 !bg-white !border-2 !border-slate-300 !z-10"
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
