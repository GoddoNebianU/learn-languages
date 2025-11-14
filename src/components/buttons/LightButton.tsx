import PlainButton, { ButtonType } from "../buttons/PlainButton";

export default function LightButton({
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
      className={`hover:bg-gray-200 text-gray-800 ${selected ? "bg-gray-200" : "bg-white"} ${className}`}
      type={type}
    >
      {children}
    </PlainButton>
  );
}
