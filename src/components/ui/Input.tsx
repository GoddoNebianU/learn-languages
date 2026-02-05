export type InputVariant = "default" | "search" | "bordered" | "filled";

interface Props {
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  className?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  variant?: InputVariant;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  ref,
  placeholder = "",
  type = "text",
  className = "",
  name = "",
  defaultValue = "",
  value,
  variant = "default",
  required = false,
  disabled = false,
  onChange,
}: Props) {
  // Variant-specific classes
  const variantStyles: Record<InputVariant, string> = {
    default: "block focus:outline-none border-b-2 border-gray-600",
    search: "flex-1 min-w-0 px-4 py-3 text-lg text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded",
    bordered: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f]",
    filled: "w-full px-3 py-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f]"
  };

  const variantClass = variantStyles[variant];

  return (
    <input
      ref={ref}
      placeholder={placeholder}
      type={type}
      className={`${variantClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      name={name}
      defaultValue={defaultValue}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
