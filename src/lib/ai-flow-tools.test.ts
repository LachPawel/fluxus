import { describe, it, expect } from 'vitest';
import {
  addNodeSchema,
  updateNodeSchema,
  deleteNodeSchema,
  connectNodesSchema,
  disconnectNodesSchema,
  clearFlowSchema,
  availableNodeTypes,
  generateFlowSystemPrompt,
} from './ai-flow-tools';

describe('ai-flow-tools', () => {
  describe('availableNodeTypes', () => {
    it('should contain expected node types', () => {
      expect(availableNodeTypes).toContain('trigger_keyword');
      expect(availableNodeTypes).toContain('action_message');
      expect(availableNodeTypes).toContain('condition_branch');
    });

    it('should be a non-empty array', () => {
      expect(Array.isArray(availableNodeTypes)).toBe(true);
      expect(availableNodeTypes.length).toBeGreaterThan(0);
    });
  });

  describe('addNodeSchema', () => {
    it('should validate valid addNode params', () => {
      const validParams = {
        nodeType: 'trigger_keyword',
        position: { x: 100, y: 200 },
      };

      const result = addNodeSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate addNode with optional data', () => {
      const validParams = {
        nodeType: 'action_message',
        position: { x: 100, y: 200 },
        data: { message: 'Hello world' },
      };

      const result = addNodeSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject invalid node type', () => {
      const invalidParams = {
        nodeType: 'invalid_node_type',
        position: { x: 100, y: 200 },
      };

      const result = addNodeSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject missing position', () => {
      const invalidParams = {
        nodeType: 'trigger_keyword',
      };

      const result = addNodeSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject invalid position coordinates', () => {
      const invalidParams = {
        nodeType: 'trigger_keyword',
        position: { x: 'not a number', y: 200 },
      };

      const result = addNodeSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('updateNodeSchema', () => {
    it('should validate valid updateNode params', () => {
      const validParams = {
        nodeId: 'node-123',
        data: { message: 'Updated message' },
      };

      const result = updateNodeSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject missing nodeId', () => {
      const invalidParams = {
        data: { message: 'Updated message' },
      };

      const result = updateNodeSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject missing data', () => {
      const invalidParams = {
        nodeId: 'node-123',
      };

      const result = updateNodeSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('deleteNodeSchema', () => {
    it('should validate valid deleteNode params', () => {
      const validParams = {
        nodeId: 'node-123',
      };

      const result = deleteNodeSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject missing nodeId', () => {
      const invalidParams = {};

      const result = deleteNodeSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('connectNodesSchema', () => {
    it('should validate valid connectNodes params', () => {
      const validParams = {
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
      };

      const result = connectNodesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate with optional handles', () => {
      const validParams = {
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        sourceHandle: 'triggered',
        targetHandle: 'in',
      };

      const result = connectNodesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject missing sourceNodeId', () => {
      const invalidParams = {
        targetNodeId: 'node-2',
      };

      const result = connectNodesSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject missing targetNodeId', () => {
      const invalidParams = {
        sourceNodeId: 'node-1',
      };

      const result = connectNodesSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('disconnectNodesSchema', () => {
    it('should validate with edgeId', () => {
      const validParams = {
        edgeId: 'edge-123',
      };

      const result = disconnectNodesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate with sourceNodeId', () => {
      const validParams = {
        sourceNodeId: 'node-1',
      };

      const result = disconnectNodesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate with targetNodeId', () => {
      const validParams = {
        targetNodeId: 'node-2',
      };

      const result = disconnectNodesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate empty object (all optional)', () => {
      const validParams = {};

      const result = disconnectNodesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });
  });

  describe('clearFlowSchema', () => {
    it('should validate with confirm true', () => {
      const validParams = {
        confirm: true,
      };

      const result = clearFlowSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate with confirm false', () => {
      const validParams = {
        confirm: false,
      };

      const result = clearFlowSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject missing confirm', () => {
      const invalidParams = {};

      const result = clearFlowSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean confirm', () => {
      const invalidParams = {
        confirm: 'yes',
      };

      const result = clearFlowSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('generateFlowSystemPrompt', () => {
    it('should return a non-empty string', () => {
      const prompt = generateFlowSystemPrompt();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should contain AI assistant context', () => {
      const prompt = generateFlowSystemPrompt();
      expect(prompt).toContain('AI assistant');
      expect(prompt).toContain('automation flows');
    });

    it('should list capabilities', () => {
      const prompt = generateFlowSystemPrompt();
      expect(prompt).toContain('Add nodes');
      expect(prompt).toContain('Update node configurations');
      expect(prompt).toContain('Delete nodes');
      expect(prompt).toContain('Connect nodes');
    });

    it('should include node type descriptions', () => {
      const prompt = generateFlowSystemPrompt();
      expect(prompt).toContain('trigger_keyword');
      expect(prompt).toContain('action_message');
      expect(prompt).toContain('condition_branch');
    });

    it('should include position guidelines', () => {
      const prompt = generateFlowSystemPrompt();
      expect(prompt).toContain('Position Guidelines');
      expect(prompt).toContain('trigger nodes');
    });

    it('should include connection guidelines', () => {
      const prompt = generateFlowSystemPrompt();
      expect(prompt).toContain('Connection Guidelines');
      expect(prompt).toContain('triggered');
      expect(prompt).toContain('input');
      expect(prompt).toContain('output');
    });
  });
});
