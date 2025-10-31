"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import IconClick from "./IconClick";
import IMAGES from "@/config/images";
import { useState } from "react";
import LightButton from "./buttons/LightButton";

function MyLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="font-bold" href={href}>
      {label}
    </Link>
  );
}
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
  return (
    <div className="flex justify-between items-center w-full h-16 px-8 bg-[#35786f] text-white">
      <Link href={"/"} className="text-xl flex">
        <Image
          src={"/favicon.ico"}
          alt="logo"
          width="32"
          height="32"
          className="rounded-4xl"
        ></Image>
        <span className="font-bold">{t("title")}</span>
      </Link>
      <div className="flex gap-4 text-xl">
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
        <MyLink href="/changelog.txt" label={t("about")}></MyLink>
        <MyLink
          href="https://github.com/GoddoNebianU/learn-languages"
          label={t("sourceCode")}
        ></MyLink>
      </div>
    </div>
  );
}
