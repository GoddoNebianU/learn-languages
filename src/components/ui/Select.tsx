export type SelectSize = "sm" | "md" | "lg";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  size?: SelectSize;
  disabled?: boolean;
  required?: boolean;
}

export function Select({
  value,
  onChange,
  children,
  className = "",
  size = "md",
  disabled = false,
  required = false,
}: Props) {
  // Size-specific classes
  const sizeStyles: Record<SelectSize, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg"
  };

  const sizeClass = sizeStyles[size];

  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f] ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      required={required}
    >
      {children}
    </select>
  );
}

interface OptionProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Option({ value, children, disabled = false }: OptionProps) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}
