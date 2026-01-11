import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlowTheme } from './use-flow-theme';

describe('useFlowTheme', () => {
  it('returns theme configuration', () => {
    const { result } = renderHook(() => useFlowTheme());

    expect(result.current).toHaveProperty('defaultEdgeOptions');
    expect(result.current).toHaveProperty('connectionLineStyle');
    expect(result.current).toHaveProperty('background');
    expect(result.current).toHaveProperty('minimap');

    expect(result.current.defaultEdgeOptions.style).toEqual({
      stroke: '#94a3b8',
      strokeWidth: 2,
    });
  });
});
