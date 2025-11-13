"use client";

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={`w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}
