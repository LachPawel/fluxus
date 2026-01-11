// These values map to our Tailwind theme
// slate-400: #94a3b8
// blue-500: #3b82f6
// slate-300: #cbd5e1
// slate-50: #f8fafc (used with opacity)

export function useFlowTheme() {
  return {
    defaultEdgeOptions: {
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    },
    connectionLineStyle: {
      stroke: '#3b82f6',
      strokeWidth: 2,
    },
    background: {
      color: '#cbd5e1',
    },
    minimap: {
      maskColor: 'rgba(248, 250, 252, 0.8)',
    },
  };
}
