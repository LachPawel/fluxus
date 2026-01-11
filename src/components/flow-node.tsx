import React, { memo, type ComponentType } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';
import {
  getNodeDef,
  getAllNodes,
  CATEGORY_COLORS,
  type FlowNodeData,
} from '@/lib/nodes';

// =============================================================================
// Dynamic Icon Component
// =============================================================================

interface IconProps {
  name: string;
  className?: string;
}

function DynamicIcon({ name, className }: IconProps) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as
    | LucideIcons.LucideIcon
    | undefined;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} />;
  }

  return <IconComponent className={className} />;
}

// =============================================================================
// Flow Node Component
// =============================================================================

interface FlowNodeComponentProps extends NodeProps<FlowNodeData> {}

function FlowNodeComponent({ data, selected }: FlowNodeComponentProps) {
  const nodeDef = getNodeDef(data.type);

  if (!nodeDef) {
    return (
      <div className="rounded-lg bg-red-500/20 border border-red-500 p-4">
        <span className="text-red-500 text-sm">Unknown node: {data.type}</span>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[nodeDef.category];
  const hasInputs = nodeDef.inputs.length > 0;

  // Get preview text from data or fall back to description
  const previewText = getPreviewText(data, nodeDef);

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[280px] rounded-lg border-2 bg-zinc-900 shadow-lg
        transition-all duration-200
        ${colors.border}
        ${selected ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-950' : ''}
      `}
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
              className="!w-3 !h-3 !bg-zinc-400 !border-2 !border-zinc-600 hover:!bg-white transition-colors"
              style={{ top: `${topPosition}%` }}
              title={input.label}
            />
          );
        })}

      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-md ${colors.bg}`}>
        <DynamicIcon name={nodeDef.icon} className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-sm font-medium ${colors.text}`}>{data.label}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-xs text-zinc-400 line-clamp-2">{previewText}</p>
      </div>

      {/* Output Handles - Different rendering for single vs multiple */}
      {nodeDef.outputs.length === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          id={nodeDef.outputs[0].id}
          className="!w-3 !h-3 !bg-zinc-400 !border-2 !border-zinc-600 hover:!bg-white transition-colors"
          style={{ top: '50%' }}
          title={nodeDef.outputs[0].label}
        />
      )}

      {/* Multiple outputs with labels */}
      {nodeDef.outputs.length > 1 && (
        <div className="flex flex-col gap-1 pb-2">
          {nodeDef.outputs.map((output) => (
            <div key={output.id} className="relative flex items-center justify-end pr-3">
              <span className="text-[10px] text-zinc-500 mr-2">{output.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className="!relative !top-0 !right-0 !transform-none !w-3 !h-3 !bg-zinc-400 !border-2 !border-zinc-600 hover:!bg-white transition-colors"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-6px',
                  transform: 'translateY(-50%)',
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
// Helper Functions
// =============================================================================

/**
 * Calculate handle position for multiple handles
 */
function calculateHandlePosition(index: number, total: number): number {
  if (total === 1) return 50;
  const spacing = 60 / (total + 1);
  return 20 + spacing * (index + 1);
}

/**
 * Get preview text from node data
 */
function getPreviewText(
  data: FlowNodeData,
  nodeDef: ReturnType<typeof getNodeDef>
): string {
  if (!nodeDef) return '';

  // Try to get a meaningful preview from the first text/textarea field
  for (const field of nodeDef.fields) {
    if ((field.type === 'text' || field.type === 'textarea') && data[field.name]) {
      const value = String(data[field.name]);
      return value.length > 80 ? value.slice(0, 80) + '...' : value;
    }
  }

  return nodeDef.description;
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
export function createNodeTypes(): Record<string, ComponentType<NodeProps<FlowNodeData>>> {
  const nodeTypes: Record<string, ComponentType<NodeProps<FlowNodeData>>> = {};

  for (const node of getAllNodes()) {
    nodeTypes[node.type] = FlowNode;
  }

  return nodeTypes;
}
