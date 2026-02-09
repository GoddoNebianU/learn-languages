"use client";

import { GhostLightButton } from "@/design-system/base/button";
import { useState } from "react";
import { Languages } from "lucide-react";

export function LanguageSettings() {
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
            <Languages onClick={handleLanguageClick} size={28} className="text-white hover:text-white/80" />
            <div className="relative">
                {showLanguageMenu && (
                    <div>
                        <div className="absolute top-10 right-0 rounded-md shadow-md flex flex-col gap-2">
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("en-US")}
                            >
                                English
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("zh-CN")}
                            >
                                中文
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("ja-JP")}
                            >
                                日本語
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("ko-KR")}
                            >
                                한국어
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("de-DE")}
                            >
                                Deutsch
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("fr-FR")}
                            >
                                Français
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("it-IT")}
                            >
                                Italiano
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("ug-CN")}
                            >
                                ئۇيغۇرچە
                            </GhostLightButton>
                        </div>
                    </div>
                )}
            </div></>
    );
}
