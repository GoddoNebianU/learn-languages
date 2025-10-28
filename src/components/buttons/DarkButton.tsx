import PlainButton from "./PlainButton";

export default function DarkButton({
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
      className={`hover:bg-gray-600 text-white ${selected ? "bg-gray-600" : "bg-gray-800"} ${className}`}
    >
      {children}
    </PlainButton>
  );
}
