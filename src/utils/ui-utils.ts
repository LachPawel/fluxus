export function getSelectLabel(
  field: { options?: { label: string; value: string }[] },
  value: unknown,
): string {
  if (!field.options) return String(value);
  const option = field.options.find((opt) => opt.value === value);
  return option ? option.label : String(value);
}
