"use client";

interface ACardProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ACard({ children, className }: ACardProps) {
  return (
    <div
      className={`${className} w-[61vw] h-96 p-2 shadow-2xl bg-white rounded-xl`}
    >
      {children}
    </div>
  );
}
