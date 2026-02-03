"use client";

import { GhostButton } from "./ui/buttons";
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
            <Languages />
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
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("ja-JP")}
                            >
                                日本語
                            </GhostButton>
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("ko-KR")}
                            >
                                한국어
                            </GhostButton>
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("de-DE")}
                            >
                                Deutsch
                            </GhostButton>
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("fr-FR")}
                            >
                                Français
                            </GhostButton>
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("it-IT")}
                            >
                                Italiano
                            </GhostButton>
                            <GhostButton
                                className="w-full bg-[#35786f]"
                                onClick={() => setLocale("ug-CN")}
                            >
                                ئۇيغۇرچە
                            </GhostButton>
                        </div>
                    </div>
                )}
            </div></>
    );
}
