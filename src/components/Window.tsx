"use client";
interface WindowProps {
  children?: React.ReactNode;
  className?: string;
}
export default function Window({ children }: WindowProps) {
  return (
    <div className="w-full bg-gray-200 h-screen flex justify-center items-center">
      {children}
    </div>
  );
}
