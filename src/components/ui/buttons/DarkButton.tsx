import PlainButton, { ButtonType } from "./PlainButton";

export default function DarkButton({
  onClick,
  className,
  selected,
  children,
  type = "button",
  disabled
}: {
  onClick?: (() => void) | undefined;
  className?: string;
  selected?: boolean;
  children?: React.ReactNode;
  type?: ButtonType;
  disabled?: boolean;
}) {
  return (
    <PlainButton
      onClick={onClick}
      className={`hover:bg-gray-100 text-black ${selected ? "bg-gray-100" : "bg-white"} ${className}`}
      type={type}
      disabled={disabled}
    >
      {children}
    </PlainButton>
  );
}
