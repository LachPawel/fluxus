import * as LucideIcons from 'lucide-react';
import {
  getNodeDef,
  CATEGORY_COLORS,
  type NodeField,
  type FlowNodeData,
} from '@/lib/nodes';

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

interface DynamicIconProps {
  name: string;
  className?: string;
}

interface FieldProps {
  field: NodeField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

// =============================================================================
// Dynamic Icon Component
// =============================================================================

function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as
    | LucideIcons.LucideIcon
    | undefined;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} />;
  }

  return <IconComponent className={className} />;
}

// =============================================================================
// Field Components
// =============================================================================

function TextField({ field, value, onChange }: FieldProps) {
  return (
    <input
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
    />
  );
}

function TextareaField({ field, value, onChange }: FieldProps) {
  return (
    <textarea
      value={String(value ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      rows={4}
      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 resize-none"
    />
  );
}

function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <select
      value={String(value ?? field.defaultValue ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
    >
      <option value="" disabled>
        Select...
      </option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function NumberField({ field, value, onChange }: FieldProps) {
  return (
    <input
      type="number"
      value={value !== undefined && value !== null ? Number(value) : ''}
      onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : null)}
      placeholder={field.placeholder}
      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
    />
  );
}

function BooleanField({ field, value, onChange }: FieldProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(field.name, e.target.checked)}
        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500/50 focus:ring-offset-zinc-900"
      />
      <span className="text-sm text-zinc-300">Enabled</span>
    </label>
  );
}

// =============================================================================
// Field Renderer
// =============================================================================

function FormField({ field, value, onChange }: FieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return <TextField field={field} value={value} onChange={onChange} />;
      case 'textarea':
        return <TextareaField field={field} value={value} onChange={onChange} />;
      case 'select':
        return <SelectField field={field} value={value} onChange={onChange} />;
      case 'number':
        return <NumberField field={field} value={value} onChange={onChange} />;
      case 'boolean':
        return <BooleanField field={field} value={value} onChange={onChange} />;
      default:
        return <TextField field={field} value={value} onChange={onChange} />;
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-zinc-300">
        {field.label}
        {field.required && <span className="text-red-400">*</span>}
      </label>
      {renderField()}
    </div>
  );
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
      <div className="w-[280px] bg-zinc-900 border-l border-zinc-800 p-4">
        <p className="text-red-400 text-sm">Unknown node type: {nodeType}</p>
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
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-800 flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${colors.bg} border-b border-zinc-800`}>
        <div className="flex items-center gap-2">
          <DynamicIcon name={nodeDef.icon} className={`w-5 h-5 ${colors.text}`} />
          <span className={`font-medium ${colors.text}`}>{data.label}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <LucideIcons.X className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs text-zinc-500">{nodeDef.description}</p>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {nodeDef.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={data[field.name]}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      {/* Footer with Delete Button */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm hover:bg-red-500/20 transition-colors"
        >
          <LucideIcons.Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
