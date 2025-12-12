export type ButtonType = "button" | "submit" | "reset" | undefined;

export default function PlainButton({
  onClick,
  className,
  children,
  type = "button",
  disabled
}: {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  type?: ButtonType;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded shadow font-bold hover:cursor-pointer ${className}`}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
