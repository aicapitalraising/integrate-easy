import { Textarea } from '@/components/ui/textarea';

interface EditableFieldProps {
  value: string;
  editMode: boolean;
  onChange: (val: string) => void;
  className?: string;
  rows?: number;
}

export function EditableField({ value, editMode, onChange, className = '', rows = 3 }: EditableFieldProps) {
  if (!editMode) {
    return <span className={className}>{value}</span>;
  }
  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`text-sm ${className}`}
    />
  );
}

interface EditableTextProps {
  value: string;
  editMode: boolean;
  onChange: (val: string) => void;
  as?: 'p' | 'span' | 'h2' | 'h3' | 'h4';
  className?: string;
}

export function EditableText({ value, editMode, onChange, as: Tag = 'p', className = '' }: EditableTextProps) {
  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }
  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={Math.max(2, Math.ceil((value || '').length / 80))}
      className={`text-sm ${className}`}
    />
  );
}
