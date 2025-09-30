export default function Button({
  label,
  onClick,
  className,
  disabled
}: {
  label:
  string, onClick?: () => void,
  className?: string,
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded bg-white shadow-2xs font-bold hover:bg-gray-300 ${className || ''}`}
      style={{
        opacity: disabled ? 0.0 : 1,
        cursor: disabled ? 'none' : 'pointer'
      }}
    >
      {label}
    </button>
  );
}