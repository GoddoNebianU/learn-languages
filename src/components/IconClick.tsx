import Image from "next/image";


interface IconClickProps {
    src: string;
    alt: string;
    onClick?: () => void;
    className?: string;
    size?: number
}
export default function IconClick(
    { src, alt, onClick = () => { }, className = '', size = 32 }: IconClickProps) {
    return (<>
        <div onClick={onClick} className={`hover:cursor-pointer hover:bg-gray-200 rounded-3xl w-[${size}px] h-[${size}px] flex justify-center items-center ${className}`}>
            <Image
                src={src}
                width={size - 5}
                height={size - 5}
                alt={alt}
            ></Image>
        </div>
    </>);
}
