import type { NodeCategory } from '@/lib/nodes';

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  trigger: 'Triggers',
  action: 'Actions',
  condition: 'Conditions',
  utility: 'Utilities',
};

export const CATEGORY_ICONS: Record<NodeCategory, string> = {
  trigger: 'Zap',
  action: 'Play',
  condition: 'GitBranch',
  utility: 'Wrench',
};
