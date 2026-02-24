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
            <GhostLightButton
                size="md"
                onClick={handleLanguageClick}
            >
                <Languages size={20} />
            </GhostLightButton>
            <div className="relative">
                {showLanguageMenu && (
                    <div>
                        <div className="absolute top-10 right-0 rounded-md shadow-md flex flex-col gap-2">
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("en-US")}
                            >
                                English
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("zh-CN")}
                            >
                                中文
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("ja-JP")}
                            >
                                日本語
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("ko-KR")}
                            >
                                한국어
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("de-DE")}
                            >
                                Deutsch
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("fr-FR")}
                            >
                                Français
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
                                onClick={() => setLocale("it-IT")}
                            >
                                Italiano
                            </GhostLightButton>
                            <GhostLightButton
                                className="w-full bg-primary-500"
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
