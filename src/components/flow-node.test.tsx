import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowNode } from './flow-node';

// Mock dependencies
vi.mock('@xyflow/react', () => ({
  Handle: ({ id, type, position }: any) => (
    <div data-testid={`handle-${type}-${position}`} id={id} />
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
  NodeProps: {},
}));

vi.mock('./flow/node-header', () => ({
  NodeHeader: ({ label }: { label: string }) => <div>Header: {label}</div>,
}));

vi.mock('./flow/node-body', () => ({
  NodeBody: () => <div>Node Body Content</div>,
}));

// Mock simple node definitions for the test
vi.mock('@/lib/nodes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/nodes')>();
  return {
    ...actual,
    getNodeDef: (type: string) => {
      if (type === 'test-node') {
        return {
          type: 'test-node',
          category: 'action',
          label: 'Test Node',
          description: '',
          icon: '',
          inputs: [{ id: 'in1', label: 'Input 1' }],
          outputs: [{ id: 'out1', label: 'Output 1' }],
          fields: [],
        };
      }
      if (type === 'multi-out') {
        return {
          type: 'multi-out',
          category: 'utility',
          label: 'Multi Output',
          description: '',
          icon: '',
          inputs: [],
          outputs: [
            { id: 'o1', label: 'Opt 1' },
            { id: 'o2', label: 'Opt 2' },
          ],
          fields: [],
        };
      }
      return null;
    },
    CATEGORY_COLORS: {
      action: { bg: 'bg-test', text: 'text-test', border: 'border-test' },
      utility: { bg: 'bg-util', text: 'text-util', border: 'border-util' },
    },
    getAllNodes: () => [],
  };
});

// Since FlowNode is a default export wrapped in memo, we need to import carefully if it wasn't named export
// Update: It seems it's a default export in file, but indexed export in `src/components/flow-node.tsx` might be different due to `export default memo(...)`.
// Let's check `src/components/flow-node.tsx` again.
// Ah, the file content I read showed `function FlowNodeComponent` and then `Memoized Export`.
// I didn't see the export statement. I'll need to check how it's exported.
// Wait, I saw `export function FlowNode` in the imports of other files like `flow-canvas`.
// Let's assume named export for now from what I've seen in other files usages: `import { FlowNode } from '@/components/flow-node';`

describe('FlowNode', () => {
  // We need to verify how FlowNode is exported first.
  // Based on `import { FlowNode } from '@/components/flow-node';` usage in `flow-canvas.tsx`, it's a named export.

  it('renders correctly for known node type', () => {
    const props: any = {
      id: '1',
      data: { type: 'test-node', label: 'My Node' },
      selected: false,
    };

    render(<FlowNode {...props} />);

    expect(screen.getByText('Header: My Node')).toBeInTheDocument();
    expect(screen.getByText('Node Body Content')).toBeInTheDocument();
  });

  it('renders error state for unknown node type', () => {
    const props: any = {
      id: '2',
      data: { type: 'unknown-type', label: 'Bad Node' },
      selected: false,
    };

    render(<FlowNode {...props} />);

    expect(screen.getByText('Unknown node: unknown-type')).toBeInTheDocument();
  });

  it('renders handles correctly', () => {
    const props: any = {
      id: '1',
      data: { type: 'test-node', label: 'My Node' },
      selected: false,
    };

    render(<FlowNode {...props} />);

    // Should have 1 input (left) and 1 output (right)
    expect(screen.getByTestId('handle-target-left')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-right')).toBeInTheDocument();
  });

  it('renders multiple outputs correctly', () => {
    const props: any = {
      id: '1',
      data: { type: 'multi-out', label: 'Multi' },
      selected: false,
    };

    render(<FlowNode {...props} />);

    expect(screen.getAllByTestId('handle-source-right')).toHaveLength(2);
    expect(screen.getByText('Opt 1')).toBeInTheDocument();
    expect(screen.getByText('Opt 2')).toBeInTheDocument();
  });
});
