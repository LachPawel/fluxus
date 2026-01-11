import type { NodeField } from '@/lib/nodes';

export interface FieldProps {
  field: NodeField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

const inputClassName =
  'w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200';

export function TextField({ field, value, onChange }: FieldProps) {
  return (
    <input
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      className={inputClassName}
    />
  );
}

export function TextareaField({ field, value, onChange }: FieldProps) {
  return (
    <textarea
      value={String(value ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      rows={4}
      className={`${inputClassName} resize-none leading-relaxed`}
    />
  );
}

export function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <select
      value={String(value ?? field.defaultValue ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      className={`${inputClassName} appearance-none cursor-pointer`}
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

export function NumberField({ field, value, onChange }: FieldProps) {
  return (
    <input
      type="number"
      value={value !== undefined && value !== null ? Number(value) : ''}
      onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : null)}
      placeholder={field.placeholder}
      className={inputClassName}
    />
  );
}

export function BooleanField({ field, value, onChange }: FieldProps) {
  return (
    <label className="flex items-center gap-3 py-1 cursor-pointer select-none group">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(field.name, e.target.checked)}
        className="w-5 h-5 cursor-pointer rounded border-slate-300 accent-blue-600 focus:ring-2 focus:ring-blue-500/50"
      />
      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
        Enabled
      </span>
    </label>
  );
}

export function FormField({ field, value, onChange }: FieldProps) {
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
    <div className="flex flex-col gap-2.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
    </div>
  );
}
