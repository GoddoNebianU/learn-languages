export default function Button({
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
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded shadow-2xs font-bold hover:bg-gray-300 hover:cursor-pointer ${selected ? "bg-gray-300" : "bg-white"} ${className}`}
    >
      {children}
    </button>
  );
}
