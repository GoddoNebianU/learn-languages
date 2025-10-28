"use client";

interface BCardProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BCard({ children, className }: BCardProps) {
  return (
    <div className={`${className} rounded-xl p-2 shadow-xl`}>{children}</div>
  );
}
