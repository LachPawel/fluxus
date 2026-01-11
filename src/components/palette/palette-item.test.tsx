import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaletteItem } from './palette-item';
import type { NodeDefinition } from '@/lib/nodes';

// Mock DynamicIcon
vi.mock('@/components/common/dynamic-icon', () => ({
  DynamicIcon: ({ name }: { name: string }) => <div data-testid="icon">{name}</div>,
}));

describe('PaletteItem', () => {
  const mockNode: NodeDefinition = {
    type: 'test-node',
    category: 'action',
    label: 'Test Action',
    description: 'A test node description',
    icon: 'Activity',
    fields: [],
    inputs: [],
    outputs: [],
  };

  it('renders node info correctly', () => {
    render(<PaletteItem node={mockNode} />);

    expect(screen.getByText('Test Action')).toBeInTheDocument();
    expect(screen.getByTitle('A test node description')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveTextContent('Activity');
  });

  it('handles drag start', () => {
    const onDragStart = vi.fn();
    render(<PaletteItem node={mockNode} onDragStart={onDragStart} />);

    const item = screen.getByText('Test Action').closest('div');
    expect(item).not.toBeNull();

    // Mock dataTransfer
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: 'none',
    };

    // Trigger dragstart
    fireEvent.dragStart(item!, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'test-node');
    expect(dataTransfer.effectAllowed).toBe('move');
    expect(onDragStart).toHaveBeenCalled();
  });
});
