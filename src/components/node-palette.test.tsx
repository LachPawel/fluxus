import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodePalette } from './node-palette';

// Mock dependencies
vi.mock('@/lib/nodes', () => ({
  getAllCategories: () => ['category1', 'category2'],
  getNodesByCategory: (cat: string) => {
    if (cat === 'category1') return [{ type: 'node1', label: 'Node 1' }];
    return [];
  },
  // We need NodeCategory type but it's erased at runtime, so logic just strings
}));

vi.mock('./palette/category-section', () => ({
  CategorySection: ({ category, isExpanded, onToggle, nodes }: any) => (
    <div data-testid={`category-${category}`}>
      <button onClick={onToggle}>{category}</button>
      {isExpanded && (
        <div data-testid={`content-${category}`}>
          {nodes.map((n: any) => (
            <div key={n.type}>{n.label}</div>
          ))}
        </div>
      )}
    </div>
  ),
}));

describe('NodePalette', () => {
  const defaultProps = {
    onDragStart: vi.fn(),
  };

  it('renders header and search', () => {
    render(<NodePalette {...defaultProps} />);

    expect(screen.getByText('Fluxus')).toBeInTheDocument();
    expect(screen.getByText('Flow Builder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search nodes...')).toBeInTheDocument();
  });

  it('renders categories', () => {
    render(<NodePalette {...defaultProps} />);

    expect(screen.getByTestId('category-category1')).toBeInTheDocument();
    expect(screen.getByTestId('category-category2')).toBeInTheDocument();
  });

  it('toggles categories', () => {
    // Mock default state: trigger and action are expanded.
    // But our mock returns 'category1' and 'category2' which are NOT in the default set(['trigger', 'action']).
    // So initially they should be collapsed.

    render(<NodePalette {...defaultProps} />);

    expect(screen.queryByTestId('content-category1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('category1'));

    expect(screen.getByTestId('content-category1')).toBeInTheDocument();
    expect(screen.getByText('Node 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('category1'));

    expect(screen.queryByTestId('content-category1')).not.toBeInTheDocument();
  });
});
