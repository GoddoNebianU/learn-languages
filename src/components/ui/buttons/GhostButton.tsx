import Link from "next/link";

export type ButtonType = "button" | "submit" | "reset" | undefined;

export default function GhostButton({
    onClick,
    className,
    children,
    type = "button",
    href
}: {
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
    type?: ButtonType;
    href?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded hover:bg-black/30 p-2 ${className}`}
            type={type}
        >
            {href ? <Link href={href}>{children}</Link> : children}
        </button>
    );
}
