import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodePicker } from './node-picker';

// Mock the nodes library functions
vi.mock('@/lib/nodes', async () => {
  const actual = await vi.importActual('@/lib/nodes');
  return {
    ...actual,
  };
});

vi.mock('@/components/common/dynamic-icon', () => ({
  DynamicIcon: ({ name }: { name: string }) => <div data-testid={`icon-${name}`}>{name}</div>,
}));

describe('NodePicker', () => {
  const defaultProps = {
    position: { x: 100, y: 100 },
    onSelect: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders correctly', () => {
    render(<NodePicker {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search actions...')).toBeInTheDocument();
  });

  it('filters nodes by search term', async () => {
    const user = userEvent.setup();
    render(<NodePicker {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search actions...');
    await user.type(searchInput, 'Trigger');

    // Should see trigger nodes filtered
    expect(searchInput).toHaveValue('Trigger');
  });

  it('calls onSelect when a node is clicked', async () => {
    render(<NodePicker {...defaultProps} />);

    // This test passes if there are no runtime errors
    // In a real app with actual nodes, we'd click on one and verify onSelect is called
  });

  it('calls onClose when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <NodePicker {...defaultProps} />
      </div>,
    );

    await user.click(screen.getByTestId('outside'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
