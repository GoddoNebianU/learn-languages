export default function Button({
  label,
  onClick,
  className = '',
  selected = false
}: {
  label:
  string,
  onClick?: () => void,
  className?: string,
  selected?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded shadow-2xs font-bold hover:bg-gray-300 hover:cursor-pointer ${selected ? 'bg-gray-300' : "bg-white"} ${className}`}
    >
      {label}
    </button>
  );
}