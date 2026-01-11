import * as LucideIcons from 'lucide-react';
import type { NodeDefinition } from '@/lib/nodes';
import { CATEGORY_COLORS } from '@/lib/nodes';
import { DynamicIcon } from '@/components/common/dynamic-icon';

interface NodeHeaderProps {
  label: string;
  icon: string;
  category: NodeDefinition['category'];
}

export function NodeHeader({ label, icon, category }: NodeHeaderProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <div className={`flex items-center justify-between px-4 py-3 gap-3 rounded-t-[10px] ${colors.bg}`}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-white shadow-sm">
          <DynamicIcon name={icon} className={`w-[18px] h-[18px] ${colors.text}`} />
        </div>
        <span className={`text-sm font-semibold ${colors.text}`}>{label}</span>
      </div>
      <button className="flex items-center justify-center p-1 rounded hover:bg-black/5 bg-transparent border-none cursor-pointer text-slate-400 transition-colors">
        <LucideIcons.MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
