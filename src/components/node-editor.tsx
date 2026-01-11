import * as LucideIcons from 'lucide-react';
import { getNodeDef, CATEGORY_COLORS, type FlowNodeData } from '@/lib/nodes';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { FormField } from './editor/form-fields';

// =============================================================================
// Types
// =============================================================================

interface NodeEditorProps {
  nodeId: string;
  nodeType: string;
  data: FlowNodeData;
  onUpdate: (id: string, data: Partial<FlowNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// =============================================================================
// Node Editor Component
// =============================================================================

export function NodeEditor({
  nodeId,
  nodeType,
  data,
  onUpdate,
  onDelete,
  onClose,
}: NodeEditorProps) {
  const nodeDef = getNodeDef(nodeType);

  if (!nodeDef) {
    return (
      <div className="w-[320px] bg-white border-l border-slate-200 p-4">
        <p className="text-red-600 text-sm">Unknown node type: {nodeType}</p>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[nodeDef.category];

  const handleFieldChange = (name: string, value: unknown) => {
    onUpdate(nodeId, { [name]: value });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      onDelete(nodeId);
    }
  };

  return (
    <div className="flex flex-col w-[340px] h-full bg-white border-l border-slate-200 shadow-xl z-20">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b border-slate-200 ${colors.bg}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <DynamicIcon name={nodeDef.icon} className={`w-[18px] h-[18px] ${colors.text}`} />
          </div>
          <span className={`text-base font-semibold ${colors.text}`}>{data.label}</span>
        </div>
        <button
          onClick={onClose}
          title="Close"
          className="flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors cursor-pointer"
        >
          <LucideIcons.X className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Description */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-sm leading-relaxed text-slate-500 m-0">{nodeDef.description}</p>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
        {nodeDef.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={data[field.name]}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-200 flex flex-col gap-3 bg-slate-50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm shadow-blue-600/20">
          Save
        </button>
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer shadow-sm"
        >
          <LucideIcons.Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
