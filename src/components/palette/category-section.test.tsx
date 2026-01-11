import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySection } from './category-section';
import type { NodeDefinition } from '@/lib/nodes';

// Mock child components
vi.mock('@/components/common/dynamic-icon', () => ({
  DynamicIcon: ({ name }: { name: string }) => <span>Icon: {name}</span>,
}));

vi.mock('./palette-item', () => ({
  PaletteItem: ({ node }: { node: NodeDefinition }) => <div>Item: {node.label}</div>,
}));

// Mock constants
vi.mock('@/utils/constants', () => ({
  CATEGORY_ICONS: { action: 'Zap' },
  CATEGORY_LABELS: { action: 'Actions' },
}));

describe('CategorySection', () => {
  const mockNodes: NodeDefinition[] = [
    {
      type: 'node1',
      label: 'Node 1',
      category: 'action',
      description: '',
      icon: '',
      fields: [],
      inputs: [],
      outputs: [],
    },
    {
      type: 'node2',
      label: 'Node 2',
      category: 'action',
      description: '',
      icon: '',
      fields: [],
      inputs: [],
      outputs: [],
    },
  ];

  it('renders nothing if no nodes', () => {
    const { container } = render(
      <CategorySection category="action" nodes={[]} isExpanded={true} onToggle={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders header with correct label and icon', () => {
    render(
      <CategorySection category="action" nodes={mockNodes} isExpanded={false} onToggle={vi.fn()} />,
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Icon: Zap')).toBeInTheDocument();
  });

  it('renders items only when expanded', () => {
    const { rerender } = render(
      <CategorySection category="action" nodes={mockNodes} isExpanded={false} onToggle={vi.fn()} />,
    );

    expect(screen.queryByText('Item: Node 1')).not.toBeInTheDocument();

    rerender(
      <CategorySection category="action" nodes={mockNodes} isExpanded={true} onToggle={vi.fn()} />,
    );

    expect(screen.getByText('Item: Node 1')).toBeInTheDocument();
    expect(screen.getByText('Item: Node 2')).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', () => {
    const onToggle = vi.fn();
    render(
      <CategorySection
        category="action"
        nodes={mockNodes}
        isExpanded={false}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
  });
});
