import type { Node, Edge } from '@xyflow/react';

// =============================================================================
// Types
// =============================================================================

export type NodeCategory = 'trigger' | 'action' | 'condition' | 'utility';

export type NodeFieldType = 'text' | 'textarea' | 'select' | 'number' | 'boolean';

export interface NodeFieldOption {
  label: string;
  value: string;
}

export interface NodeField {
  name: string;
  label: string;
  type: NodeFieldType;
  required?: boolean;
  placeholder?: string;
  options?: NodeFieldOption[];
  defaultValue?: string | number | boolean;
}

export interface NodePort {
  id: string;
  label: string;
}

export interface NodeDefinition {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  fields: NodeField[];
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface FlowNodeData {
  type: string;
  label: string;
  [key: string]: unknown;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Category Colors
// =============================================================================

export const CATEGORY_COLORS: Record<NodeCategory, { bg: string; border: string; text: string }> = {
  trigger: {
    bg: 'bg-green-500/10',
    border: 'border-green-500',
    text: 'text-green-500',
  },
  action: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    text: 'text-blue-500',
  },
  condition: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500',
    text: 'text-amber-500',
  },
  utility: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500',
    text: 'text-purple-500',
  },
};

// =============================================================================
// Node Registry
// =============================================================================

export const NODE_REGISTRY: Record<string, NodeDefinition> = {
  trigger_keyword: {
    type: 'trigger_keyword',
    category: 'trigger',
    label: 'Keyword Trigger',
    description: 'Triggers the flow when a specific keyword is received',
    icon: 'MessageSquare',
    fields: [
      {
        name: 'keywords',
        label: 'Keywords',
        type: 'text',
        required: true,
        placeholder: 'Enter keywords separated by commas',
      },
      {
        name: 'matchType',
        label: 'Match Type',
        type: 'select',
        required: true,
        defaultValue: 'exact',
        options: [
          { label: 'Exact Match', value: 'exact' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts With', value: 'startsWith' },
          { label: 'Ends With', value: 'endsWith' },
          { label: 'Regex', value: 'regex' },
        ],
      },
    ],
    inputs: [],
    outputs: [{ id: 'triggered', label: 'Triggered' }],
  },

  action_message: {
    type: 'action_message',
    category: 'action',
    label: 'Send Message',
    description: 'Sends a text message to the user',
    icon: 'Send',
    fields: [
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter your message here. Use {{variable}} for dynamic content.',
      },
    ],
    inputs: [{ id: 'in', label: 'Input' }],
    outputs: [{ id: 'sent', label: 'Sent' }],
  },

  condition_branch: {
    type: 'condition_branch',
    category: 'condition',
    label: 'Condition Branch',
    description: 'Branches the flow based on a condition',
    icon: 'GitBranch',
    fields: [
      {
        name: 'variable',
        label: 'Variable',
        type: 'text',
        required: true,
        placeholder: 'e.g., {{user.name}} or {{message}}',
      },
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        required: true,
        defaultValue: 'equals',
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Not Equals', value: 'notEquals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Not Contains', value: 'notContains' },
          { label: 'Greater Than', value: 'greaterThan' },
          { label: 'Less Than', value: 'lessThan' },
          { label: 'Is Empty', value: 'isEmpty' },
          { label: 'Is Not Empty', value: 'isNotEmpty' },
        ],
      },
      {
        name: 'value',
        label: 'Value',
        type: 'text',
        required: false,
        placeholder: 'Value to compare against',
      },
    ],
    inputs: [{ id: 'in', label: 'Input' }],
    outputs: [
      { id: 'true', label: 'True' },
      { id: 'false', label: 'False' },
    ],
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a node definition by type
 */
export function getNodeDef(type: string): NodeDefinition | undefined {
  return NODE_REGISTRY[type];
}

/**
 * Get all nodes in a specific category
 */
export function getNodesByCategory(category: NodeCategory): NodeDefinition[] {
  return Object.values(NODE_REGISTRY).filter((node) => node.category === category);
}

/**
 * Get all registered nodes
 */
export function getAllNodes(): NodeDefinition[] {
  return Object.values(NODE_REGISTRY);
}

/**
 * Get all available categories
 */
export function getAllCategories(): NodeCategory[] {
  return ['trigger', 'action', 'condition', 'utility'];
}

/**
 * Create initial node data from a node definition
 */
export function createNodeData(type: string): FlowNodeData | undefined {
  const def = getNodeDef(type);
  if (!def) return undefined;

  const data: FlowNodeData = {
    type: def.type,
    label: def.label,
  };

  // Set default values from fields
  for (const field of def.fields) {
    if (field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue;
    }
  }

  return data;
}
