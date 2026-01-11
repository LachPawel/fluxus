import * as LucideIcons from 'lucide-react';

export interface DynamicIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DynamicIcon({ name, className, style }: DynamicIconProps) {
  // Cast to efficient type access
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as
    | LucideIcons.LucideIcon
    | undefined;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} style={style} />;
  }

  return <IconComponent className={className} style={style} />;
}
