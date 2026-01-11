import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeBody } from './node-body';
import { NodeDefinition } from '@/lib/nodes';

describe('NodeBody', () => {
  const mockNodeDef: NodeDefinition = {
    type: 'test',
    category: 'action',
    label: 'Test Node',
    description: '',
    icon: '',
    inputs: [],
    outputs: [],
    fields: [
      { name: 'field1', label: 'Field 1', type: 'text' },
      {
        name: 'field2',
        label: 'Field 2',
        type: 'select',
        options: [{ label: 'Opt A', value: 'a' }],
      },
      { name: 'keywords', label: 'Keywords', type: 'text' },
    ],
  };

  it('renders field values correctly', () => {
    const data = {
      type: 'test',
      label: 'Test',
      field1: 'Value 1',
    };

    render(<NodeBody nodeDef={mockNodeDef} data={data} />);

    expect(screen.getByText('Field 1')).toBeInTheDocument();
    expect(screen.getByText('Value 1')).toBeInTheDocument();
  });

  it('renders select field label instead of value', () => {
    const data = {
      type: 'test',
      label: 'Test',
      field2: 'a',
    };

    render(<NodeBody nodeDef={mockNodeDef} data={data} />);

    expect(screen.getByText('Field 2')).toBeInTheDocument();
    expect(screen.getByText('Opt A')).toBeInTheDocument();
  });

  it('renders keywords as multiple tags', () => {
    // We need to modify the node def to make keywords visible (slice(0,2) limit in component)
    const keywordsNodeDef: NodeDefinition = {
      ...mockNodeDef,
      fields: [{ name: 'keywords', label: 'Keywords', type: 'text' }],
    };
    const data = {
      type: 'test',
      label: 'Test',
      keywords: 'tag1, tag2',
    };

    render(<NodeBody nodeDef={keywordsNodeDef} data={data} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('truncates long text', () => {
    const longText = 'a'.repeat(100);
    const data = {
      type: 'test',
      label: 'Test',
      field1: longText,
    };

    render(<NodeBody nodeDef={mockNodeDef} data={data} />);
    const displayed = screen.getByText(
      (content) => content.startsWith('aaaa') && content.endsWith('...'),
    );
    expect(displayed).toBeInTheDocument();
  });
});
