import NavbarWrapper from "./NavbarWrapper";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function NavbarCenterWrapper({ children, className }: Props) {
  return (
    <NavbarWrapper>
      <div
        className={`flex-1 flex justify-center items-center ${className}`}
      >
        {children}
      </div>
    </NavbarWrapper>
  );
}
