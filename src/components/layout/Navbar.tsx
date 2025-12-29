import Image from "next/image";
import IMAGES from "@/config/images";
import { Folder, Home, User } from "lucide-react";
import LanguageSettings from "../LanguageSettings";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GhostButton } from "../ui/buttons";

export async function Navbar() {
  const t = await getTranslations("navbar");
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="flex justify-between items-center w-full h-16 px-4 md:px-8 bg-[#35786f] text-white">
      <GhostButton href="/" className="text-lg md:text-xl border-b hidden! md:block!">
        {t("title")}
      </GhostButton>
      <GhostButton className="block! md:hidden!" href={"/"}>
        <Home size={20} />
      </GhostButton>
      <div className="flex text-base md:text-xl gap-0.5 justify-center items-center flex-wrap">
        <LanguageSettings />
        <GhostButton
          className="md:hidden! block! border-0 bg-transparent hover:bg-black/30 shadow-none p-2"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          <Image
            src={IMAGES.github_mark_white}
            alt="GitHub"
            width={20}
            height={20}
          />
        </GhostButton>
        <GhostButton href="/folders" className="md:block! hidden! border-0 bg-transparent hover:bg-black/30 shadow-none">
          {t("folders")}
        </GhostButton>
        <GhostButton href="/folders" className="md:hidden! block! border-0 bg-transparent hover:bg-black/30 shadow-none p-2">
          <Folder size={20} />
        </GhostButton>
        <GhostButton
          className="hidden! md:block! border-0 bg-transparent hover:bg-black/30 shadow-none"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </GhostButton>
        {
          (() => {
            return session &&
              <>
                <GhostButton href="/profile" className="hidden! md:block! text-sm md:text-base border-0 bg-transparent hover:bg-black/30 shadow-none px-2 py-1">{t("profile")}</GhostButton>
                <GhostButton href="/profile" className="md:hidden! block! border-0 bg-transparent hover:bg-black/30 shadow-none p-2">
                  <User size={20} />
                </GhostButton>
              </>
              || <>
                <GhostButton href="/auth" className="hidden! md:block! text-sm md:text-base border-0 bg-transparent hover:bg-black/30 shadow-none px-2 py-1">{t("sign_in")}</GhostButton>
                <GhostButton href="/auth" className="md:hidden! block! border-0 bg-transparent hover:bg-black/30 shadow-none p-2">
                  <User size={20} />
                </GhostButton>
              </>;

          })()
        }
      </div>
    </div>
  );
}
