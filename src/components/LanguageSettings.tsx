"use client";

import IMAGES from "@/config/images";
import IconClick from "./ui/buttons/IconClick";
import { useState } from "react";
import GhostButton from "./ui/buttons/GhostButton";

export default function LanguageSettings() {
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const handleLanguageClick = () => {
        setShowLanguageMenu((prev) => !prev);
    };
    const setLocale = async (locale: string) => {
        document.cookie = `locale=${locale}`;
        window.location.reload();
    };
    return (
        <>
            <IconClick
                src={IMAGES.language_white}
                alt="language"
                disableOnHoverBgChange={true}
                onClick={handleLanguageClick}
            ></IconClick>
            <div className="relative">
                {showLanguageMenu && (
                    <div>
                        <div className="absolute top-10 right-0 rounded-md shadow-md flex flex-col gap-2">
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("en-US")}
                            >
                                English
                            </GhostButton>
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("zh-CN")}
                            >
                                中文
                            </GhostButton>
                        </div>
                    </div>
                )}
            </div></>
    );
}
