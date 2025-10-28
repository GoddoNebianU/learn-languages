export default function PlainButton({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded shadow font-bold hover:cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
