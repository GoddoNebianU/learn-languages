export type TextareaVariant = "default" | "bordered" | "filled";

interface Props {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: TextareaVariant;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  name?: string;
}

export function Textarea({
  value,
  defaultValue,
  onChange,
  placeholder = "",
  className = "",
  variant = "default",
  disabled = false,
  required = false,
  rows = 3,
  name = "",
}: Props) {
  // Variant-specific classes
  const variantStyles: Record<TextareaVariant, string> = {
    default: "block focus:outline-none border-b-2 border-gray-600 resize-none",
    bordered: "w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f] resize-none",
    filled: "w-full bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f] resize-none"
  };

  const variantClass = variantStyles[variant];

  return (
    <textarea
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`${variantClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      required={required}
      rows={rows}
      name={name}
    />
  );
}
