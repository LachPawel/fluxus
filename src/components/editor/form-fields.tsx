import type { NodeField } from '@/lib/nodes';

export interface FieldProps {
  field: NodeField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

export function TextField({ field, value, onChange }: FieldProps) {
  return (
    <input
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      style={{ 
        width: '100%', 
        padding: '12px 16px', 
        fontSize: 14,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        color: '#1e293b',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
      }}
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
      style={{ 
        width: '100%', 
        padding: '12px 16px', 
        fontSize: 14, 
        lineHeight: 1.6, 
        resize: 'none',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        color: '#1e293b',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

export function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <select
      value={String(value ?? field.defaultValue ?? '')}
      onChange={(e) => onChange(field.name, e.target.value)}
      style={{ 
        width: '100%', 
        padding: '12px 16px', 
        fontSize: 14,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        color: '#1e293b',
        outline: 'none',
        appearance: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
      }}
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
      style={{ 
        width: '100%', 
        padding: '12px 16px', 
        fontSize: 14,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        color: '#1e293b',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

export function BooleanField({ field, value, onChange }: FieldProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(field.name, e.target.checked)}
        style={{ width: 20, height: 20, cursor: 'pointer' }}
      />
      <span style={{ fontSize: 14, color: '#334155' }}>Enabled</span>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#334155' }}>
        {field.label}
        {field.required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {renderField()}
    </div>
  );
}
