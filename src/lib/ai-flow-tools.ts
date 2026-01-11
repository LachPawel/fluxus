import { z } from 'zod';
import { NODE_REGISTRY } from './nodes';

// =============================================================================
// Zod Schemas for AI Tools
// =============================================================================

/**
 * Get available node types for validation
 */
export const availableNodeTypes = Object.keys(NODE_REGISTRY);

/**
 * Schema for adding a node
 */
export const addNodeSchema = z.object({
  nodeType: z
    .enum(availableNodeTypes as [string, ...string[]])
    .describe(`The type of node to add. Available types: ${availableNodeTypes.join(', ')}`),
  position: z
    .object({
      x: z.number().describe('X coordinate on the canvas'),
      y: z.number().describe('Y coordinate on the canvas'),
    })
    .describe('Position to place the node on the canvas'),
  data: z.record(z.unknown()).optional().describe('Initial data/configuration for the node fields'),
});

/**
 * Schema for updating a node
 */
export const updateNodeSchema = z.object({
  nodeId: z.string().describe('The ID of the node to update'),
  data: z.record(z.unknown()).describe('The data fields to update on the node'),
});

/**
 * Schema for deleting a node
 */
export const deleteNodeSchema = z.object({
  nodeId: z.string().describe('The ID of the node to delete'),
});

/**
 * Schema for connecting two nodes
 */
export const connectNodesSchema = z.object({
  sourceNodeId: z.string().describe('The ID of the source node'),
  targetNodeId: z.string().describe('The ID of the target node'),
  sourceHandle: z.string().optional().describe('The output handle ID on the source node'),
  targetHandle: z.string().optional().describe('The input handle ID on the target node'),
});

/**
 * Schema for disconnecting nodes
 */
export const disconnectNodesSchema = z.object({
  edgeId: z.string().optional().describe('The specific edge ID to remove'),
  sourceNodeId: z.string().optional().describe('Remove all edges from this source node'),
  targetNodeId: z.string().optional().describe('Remove all edges to this target node'),
});

/**
 * Schema for clearing the entire flow
 */
export const clearFlowSchema = z.object({
  confirm: z.boolean().describe('Must be true to confirm clearing the flow'),
});

// =============================================================================
// Helper to generate system prompt with node info
// =============================================================================

export function generateFlowSystemPrompt(): string {
  const nodeDescriptions = Object.values(NODE_REGISTRY)
    .map((node) => {
      const fieldsDesc = node.fields
        .map((f) => {
          let desc = `${f.name} (${f.type}${f.required ? ', required' : ''})`;
          if (f.options) {
            desc += `: options are ${f.options.map((o) => o.value).join('/')}`;
          }
          if (f.placeholder) {
            desc += ` - ${f.placeholder}`;
          }
          return desc;
        })
        .join('; ');

      const inputsDesc =
        node.inputs.length > 0
          ? `Inputs: ${node.inputs.map((i) => i.id).join(', ')}`
          : 'No inputs (start node)';

      const outputsDesc =
        node.outputs.length > 0
          ? `Outputs: ${node.outputs.map((o) => o.id).join(', ')}`
          : 'No outputs (end node)';

      return `
### ${node.label} (type: ${node.type})
Category: ${node.category}
Description: ${node.description}
Fields: ${fieldsDesc || 'None'}
${inputsDesc}
${outputsDesc}`;
    })
    .join('\n');

  return `You are an AI assistant that helps users create and edit automation flows for a WhatsApp chatbot builder.

## Your Capabilities
You can:
1. Add nodes to the flow canvas
2. Update node configurations
3. Delete nodes
4. Connect nodes together
5. Disconnect nodes
6. Clear the entire flow
7. View the current flow state

## Available Node Types
${nodeDescriptions}

## Guidelines
- When creating flows, position nodes with reasonable spacing (around 200-300 pixels apart vertically)
- Start flows with trigger nodes (like trigger_keyword)
- Connect nodes in logical sequences
- When the user describes a flow, break it down into nodes and connections
- Always explain what you're doing as you build the flow
- If the user's request is unclear, ask clarifying questions
- Use the getFlowState tool first if you need to understand the current canvas state

## Position Guidelines
- Place trigger nodes near the top (y: 100-200)
- Place subsequent nodes below, incrementing y by ~200 for each step
- Keep x around 250-350 for a centered flow
- For branches (condition nodes), offset branches horizontally (x ± 200)

## Connection Guidelines
- Trigger nodes have outputs like "triggered"
- Action nodes have "in" input and "sent" output
- Condition nodes have "in" input and "true"/"false" outputs
- Always specify the correct handles when connecting`;
}

// =============================================================================
// Types
// =============================================================================

export type AddNodeParams = z.infer<typeof addNodeSchema>;
export type UpdateNodeParams = z.infer<typeof updateNodeSchema>;
export type DeleteNodeParams = z.infer<typeof deleteNodeSchema>;
export type ConnectNodesParams = z.infer<typeof connectNodesSchema>;
export type DisconnectNodesParams = z.infer<typeof disconnectNodesSchema>;
export type ClearFlowParams = z.infer<typeof clearFlowSchema>;
