import PlainButton from "./PlainButton";

export default function LightButton({
  onClick,
  className,
  selected,
  children,
}: {
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <PlainButton
      onClick={onClick}
      className={`hover:bg-gray-200 text-gray-800 ${selected ? "bg-gray-200" : "bg-white"} ${className}`}
    >
      {children}
    </PlainButton>
  );
}
