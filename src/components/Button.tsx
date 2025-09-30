export default function Button({ label, onClick, className }: { label: string, onClick?: () => void, className?: string }) {
  return (
    <button onClick={onClick} className={`px-2 py-1 rounded bg-white shadow-2xs font-bold hover:bg-gray-300 ${className || ''}`}>
      {label}
    </button>
  );
}