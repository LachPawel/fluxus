import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from './form-fields';
import type { NodeField } from '@/lib/nodes';

describe('FormField', () => {
  const handleChange = vi.fn();

  it('renders a text input correctly', () => {
    const field: NodeField = {
      name: 'test-text',
      label: 'Test Text',
      type: 'text',
      placeholder: 'Enter text',
    };

    render(<FormField field={field} value="initial" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('initial');

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledWith('test-text', 'new value');
  });

  it('renders a textarea correctly', () => {
    const field: NodeField = {
      name: 'test-area',
      label: 'Test Area',
      type: 'textarea',
      placeholder: 'Enter long text',
    };

    render(<FormField field={field} value="long text" onChange={handleChange} />);

    const textarea = screen.getByPlaceholderText('Enter long text');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('long text');

    fireEvent.change(textarea, { target: { value: 'updated text' } });
    expect(handleChange).toHaveBeenCalledWith('test-area', 'updated text');
  });

  it('renders a select input correctly', () => {
    const field: NodeField = {
      name: 'test-select',
      label: 'Test Select',
      type: 'select',
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ],
    };

    render(<FormField field={field} value="a" onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('a');

    fireEvent.change(select, { target: { value: 'b' } });
    expect(handleChange).toHaveBeenCalledWith('test-select', 'b');
  });

  it('renders a checkbox for boolean correctly', () => {
    const field: NodeField = {
      name: 'test-bool',
      label: 'Test Bool',
      type: 'boolean',
    };

    render(<FormField field={field} value={false} onChange={handleChange} />);

    // We search by label text "Enabled" which is hardcoded in the component
    const checkbox = screen.getByLabelText('Enabled');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith('test-bool', true);
  });

  it('renders a number input correctly', () => {
    const field: NodeField = {
      name: 'test-number',
      label: 'Test Number',
      type: 'number',
      placeholder: 'Enter number',
    };

    render(<FormField field={field} value={10} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(10);

    fireEvent.change(input, { target: { value: '20' } });
    expect(handleChange).toHaveBeenCalledWith('test-number', 20);
  });
});
