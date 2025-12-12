import PlainButton, { ButtonType } from "../buttons/PlainButton";

export default function LightButton({
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
