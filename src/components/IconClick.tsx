import Image from "next/image";


interface IconClickProps {
  src: string;
  alt: string;
  onClick?: () => void;
}
export default function IconClick(
  { src, alt, onClick = () => { } }: IconClickProps) {
  return (<>
    <div onClick={onClick} className="hover:cursor-pointer hover:bg-gray-200 rounded-3xl p-1">
      <Image
        src={src}
        width={32}
        height={32}
        alt={alt}
      ></Image>
    </div>
  </>);
}
