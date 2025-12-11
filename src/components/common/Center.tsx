export const Center = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-[calc(100dvh-64px)]">
      {children}
    </div>
  );
};
