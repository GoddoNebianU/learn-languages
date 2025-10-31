import Image from "next/image";

interface IconClickProps {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
  size?: number;
  disableOnHoverBgChange?: boolean;
}
export default function IconClick({
  src,
  alt,
  onClick = () => {},
  className = "",
  size = 32,
  disableOnHoverBgChange = false,
}: IconClickProps) {
  return (
    <>
      <div
        onClick={onClick}
        className={`${disableOnHoverBgChange ? "" : "hover:bg-gray-200"}hover:cursor-pointer rounded-3xl w-[${size}px] h-[${size}px] flex justify-center items-center ${className}`}
      >
        <Image src={src} width={size - 5} height={size - 5} alt={alt}></Image>
      </div>
    </>
  );
}
