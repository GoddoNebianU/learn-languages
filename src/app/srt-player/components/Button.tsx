export default function Button({ label, onClick }: { label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="m-1 px-2 py-1 rounded bg-white shadow-2xs font-bold hover:bg-gray-300">
      {label}
    </button>
  );
}