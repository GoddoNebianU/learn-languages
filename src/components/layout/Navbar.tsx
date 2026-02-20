import Image from "next/image";
import { IMAGES } from "@/config/images";
import { Folder, Home, User } from "lucide-react";
import { LanguageSettings } from "./LanguageSettings";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GhostLightButton } from "@/design-system/base/button";

export async function Navbar() {
  const t = await getTranslations("navbar");
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="flex justify-between items-center w-full h-16 px-4 md:px-8 bg-primary-500 text-white">
      <GhostLightButton href="/" className="border-b hidden! md:block!" size="md">
        {t("title")}
      </GhostLightButton>
      <GhostLightButton className="block! md:hidden!" size="md" href={"/"}>
        <Home size={20} />
      </GhostLightButton>
      <div className="flex gap-0.5 justify-center items-center">
        <LanguageSettings />
        <GhostLightButton
          className="md:hidden! block!"
          size="md"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          <Image
            src={IMAGES.github_mark_white}
            alt="GitHub"
            width={20}
            height={20}
          />
        </GhostLightButton>
        <GhostLightButton href="/folders" className="md:block! hidden!" size="md">
          {t("folders")}
        </GhostLightButton>
        <GhostLightButton href="/folders" className="md:hidden! block!" size="md">
          <Folder size={20} />
        </GhostLightButton>
        <GhostLightButton
          className="hidden! md:block!"
          size="md"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </GhostLightButton>
        {
          (() => {
            return session &&
              <>
                <GhostLightButton href="/profile" className="hidden! md:block!" size="md">{t("profile")}</GhostLightButton>
                <GhostLightButton href="/profile" className="md:hidden! block!" size="md">
                  <User size={20} />
                </GhostLightButton>
              </>
              || <>
                <GhostLightButton href="/login" className="hidden! md:block!" size="md">{t("sign_in")}</GhostLightButton>
                <GhostLightButton href="/login" className="md:hidden! block!" size="md">
                  <User size={20} />
                </GhostLightButton>
              </>;
          })()
        }
      </div>
    </div>
  );
}
