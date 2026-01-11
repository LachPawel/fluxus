import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DynamicIcon } from './dynamic-icon';

describe('DynamicIcon', () => {
  it('renders a known icon', () => {
    // Info icon should probably exist in lucide-react
    const { container } = render(<DynamicIcon name="Info" />);
    // Lucide icons usually render as SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback icon for unknown name', () => {
    const { container } = render(<DynamicIcon name="UnknownIconName123" />);
    // Should render HelpCircle (which is an SVG)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('passes className to the icon', () => {
    const { container } = render(<DynamicIcon name="Info" className="test-class" />);
    expect(container.querySelector('svg')).toHaveClass('test-class');
  });
});
