import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeEditor } from './node-editor';

// Mock dependencies
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
          description: 'Test Description',
          icon: 'Box',
          fields: [{ name: 'field1', label: 'Field 1', type: 'text' }],
        };
      }
      return null;
    },
    CATEGORY_COLORS: {
      action: { bg: 'bg-test', text: 'text-test' },
    },
  };
});

vi.mock('@/components/common/dynamic-icon', () => ({
  DynamicIcon: () => <div />,
}));

vi.mock('./editor/form-fields', () => ({
  FormField: ({ field, value, onChange }: any) => (
    <input
      data-testid={`field-${field.name}`}
      value={value || ''}
      onChange={(e) => onChange(field.name, e.target.value)}
    />
  ),
}));

describe('NodeEditor', () => {
  const mockProps = {
    nodeId: '1',
    nodeType: 'test-node',
    data: { type: 'test-node', label: 'My Node', field1: 'val' },
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders correctly', () => {
    render(<NodeEditor {...mockProps} />);

    expect(screen.getByText('My Node')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('field-field1')).toHaveValue('val');
  });

  it('calls onUpdate when field changes', () => {
    render(<NodeEditor {...mockProps} />);

    const input = screen.getByTestId('field-field1');
    fireEvent.change(input, { target: { value: 'new val' } });

    expect(mockProps.onUpdate).toHaveBeenCalledWith('1', { field1: 'new val' });
  });

  it('calls onClose when close button clicked', () => {
    render(<NodeEditor {...mockProps} />);

    const closeBtn = screen.getByTitle('Close');
    fireEvent.click(closeBtn);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onDelete when delete button clicked and confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(<NodeEditor {...mockProps} />);

    const deleteBtn = screen.getByText('Delete Node');
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });
});
