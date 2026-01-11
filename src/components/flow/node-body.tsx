import type { NodeDefinition, FlowNodeData } from '@/lib/nodes';
import { CATEGORY_COLORS } from '@/lib/nodes';
import { getSelectLabel } from '@/utils/ui-utils';

interface NodeBodyProps {
  nodeDef: NodeDefinition;
  data: FlowNodeData;
}

export function NodeBody({ nodeDef, data }: NodeBodyProps) {
  const colors = CATEGORY_COLORS[nodeDef.category];

  return (
    <div className="p-4 pb-5">
      <div className="flex flex-col gap-4">
        {nodeDef.fields.slice(0, 2).map((field) => {
          const value = data[field.name];
          if (!value) return null;
          
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <label className="text-[11px] tracking-wider uppercase font-medium text-slate-500">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-700">
                    {getSelectLabel(field, value)}
                  </span>
                </div>
              ) : field.name === 'keywords' ? (
                <div className="flex flex-wrap gap-2">
                  {String(value).split(',').map((keyword, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-md text-[13px] font-medium ${colors.bg} ${colors.text}`}
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600 m-0">
                  {String(value).slice(0, 80)}{String(value).length > 80 ? '...' : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
