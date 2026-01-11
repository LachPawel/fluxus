import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the FlowCanvas component as it's complex and we just want to test App renders it
vi.mock('@/components/flow-canvas', () => ({
  FlowCanvas: () => <div data-testid="flow-canvas">FlowCanvas Mock</div>,
}));

describe('App', () => {
  it('renders FlowCanvas', () => {
    render(<App />);
    expect(screen.getByTestId('flow-canvas')).toBeInTheDocument();
  });
});
