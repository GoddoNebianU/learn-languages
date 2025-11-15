"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import IconClick from "./IconClick";
import IMAGES from "@/config/images";
import { useState } from "react";
import LightButton from "./buttons/LightButton";
import { useSession } from "next-auth/react";
import { Folder, Home } from "lucide-react";

export function Navbar() {
  const t = useTranslations("navbar");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const handleLanguageClick = () => {
    setShowLanguageMenu((prev) => !prev);
  };
  const setLocale = async (locale: string) => {
    document.cookie = `locale=${locale}`;
    window.location.reload();
  };
  const session = useSession();
  return (
    <div className="flex justify-between items-center w-full h-16 px-8 bg-[#35786f] text-white">
      <Link href={"/"} className="text-xl border-b hidden md:block">
        {t("title")}
      </Link>
      <Link className="block md:hidden" href={"/"}>
        <Home />
      </Link>
      <div className="flex gap-4 text-xl justify-center items-center flex-wrap">
        <Link
          className="md:hidden block"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          <Image
            src={IMAGES.github_mark_white}
            alt="GitHub"
            width={24}
            height={24}
          />
        </Link>
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
          <IconClick
            src={IMAGES.language_white}
            alt="language"
            disableOnHoverBgChange={true}
            onClick={handleLanguageClick}
          ></IconClick>
        </div>
        <Link href="/folders" className="md:block hidden">
          {t("folders")}
        </Link>
        <Link href="/folders" className="md:hidden block">
          <Folder />
        </Link>
        {session?.status === "authenticated" ? (
          <div className="flex gap-2">
            <Link href="/profile">{t("profile")}</Link>
          </div>
        ) : (
          <Link href="/login">{t("login")}</Link>
        )}
        <Link href="/changelog.txt">{t("about")}</Link>
        <Link
          className="hidden md:block"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </Link>
      </div>
    </div>
  );
}
