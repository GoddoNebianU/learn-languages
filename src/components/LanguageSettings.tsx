"use client";

import IMAGES from "@/config/images";
import IconClick from "./IconClick";
import { useState } from "react";
import LightButton from "./buttons/LightButton";

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
                            <LightButton
                                className="w-full"
                                onClick={() => setLocale("en-US")}
                            >
                                English
                            </LightButton>
                            <LightButton
                                className="w-full"
                                onClick={() => setLocale("zh-CN")}
                            >
                                中文
                            </LightButton>
                        </div>
                    </div>
                )}
            </div></>
    );
}