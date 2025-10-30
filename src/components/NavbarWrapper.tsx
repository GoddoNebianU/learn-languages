import { Navbar } from "./Navbar";

interface Props {
  children: React.ReactNode;
}

export default function NavbarWrapper({ children }: Props) {
  return (
    <div className="h-screen flex flex-col">
      <Navbar></Navbar>
      {children}
    </div>
  );
}
