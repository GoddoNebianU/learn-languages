interface Props {
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  className?: string;
}

export default function Input({
  ref,
  placeholder = "",
  type = "text",
  className = "",
}: Props) {
  return (
    <input
      ref={ref}
      placeholder={placeholder}
      type={type}
      className={`block focus:outline-none border-b-2 border-gray-600 ${className}`}
    />
  );
}
