import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectNodeIcon } from './select-node-icon';

describe('SelectNodeIcon', () => {
  it('renders svg', () => {
    const { container } = render(<SelectNodeIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('passes props to svg', () => {
    const { container } = render(<SelectNodeIcon className="test-class" width={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('test-class');
    expect(svg).toHaveAttribute('width', '32');
  });

  it('passes props to svg (2)', () => {
    const { container } = render(<SelectNodeIcon className="test-class" id="my-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('test-class');
    expect(svg).toHaveAttribute('id', 'my-icon');
  });
});
