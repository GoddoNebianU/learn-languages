"use client";

interface ACardProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ACard({ children, className }: ACardProps) {
  return (
    <div
      className={`${className} w-[95dvw] md:w-[61vw] h-96 p-2 md:shadow-2xl rounded-xl`}
    >
      {children}
    </div>
  );
}
