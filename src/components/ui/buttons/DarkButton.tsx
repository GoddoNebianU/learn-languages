import PlainButton, { ButtonType } from "./PlainButton";

export default function DarkButton({
  onClick,
  className,
  selected,
  children,
  type = "button",
}: {
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  children?: React.ReactNode;
  type?: ButtonType;
}) {
  return (
    <PlainButton
      onClick={onClick}
      className={`hover:bg-gray-600 text-white ${selected ? "bg-gray-600" : "bg-gray-800"} ${className}`}
      type={type}
    >
      {children}
    </PlainButton>
  );
}
