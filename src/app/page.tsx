import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn Languages — AI-Powered Language Learning",
  description:
    "A modern language learning platform with AI-powered translation, dictionary, text-to-speech, and flashcard tools.",
};

interface LinkAreaProps {
  href: string;
  name: string;
  description: string;
  color: string;
}

function LinkArea({ href, name, description, color }: LinkAreaProps) {
  return (
    <Link
      href={href}
      style={{ backgroundColor: color }}
      className={`flex h-32 items-center transition-transform duration-200 hover:scale-105 md:h-64 md:justify-center`}
    >
      <div className="m-8 text-white">
        <h1 className="text-3xl md:text-4xl">{name}</h1>
        <p className="md:text-xl">{description}</p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <>
      <div className="flex min-h-[75dvh] w-full items-center justify-center bg-primary-500 text-white">
        <div className="mx-16 mb-16 md:mx-0 md:max-w-[60dvw]">
          <h1 className="mb-8 text-6xl font-extrabold md:text-9xl">{t("title")}</h1>
          <p className="text-2xl font-medium md:text-5xl">{t("description")}</p>
        </div>
      </div>
      <div className="flex h-[25dvh] min-h-64 w-full flex-col items-center justify-center font-serif">
        <p className="text-3xl">{t("fortune.quote")}</p>
        <cite className="text-xl text-[#e9b353]">{t("fortune.author")}</cite>
      </div>
      <div className="flex h-32 w-full flex-col items-center justify-center bg-[#bbbbbb]">
        <div className="h-0 w-0 border-t-30 border-r-40 border-l-40 border-t-white border-r-transparent border-l-transparent"></div>
      </div>
      <div className="grid w-full grid-cols-1 grid-rows-6 md:grid-cols-3">
        <LinkArea
          href="/translator"
          name={t("translator.name")}
          description={t("translator.description")}
          color="#a56068"
        ></LinkArea>
        <LinkArea
          href="/text-speaker"
          name={t("textSpeaker.name")}
          description={t("textSpeaker.description")}
          color="#578aad"
        ></LinkArea>
        <LinkArea
          href="/srt-player"
          name={t("srtPlayer.name")}
          description={t("srtPlayer.description")}
          color="#3c988d"
        ></LinkArea>
        <LinkArea
          href="/dictionary"
          name={t("dictionary.name")}
          description={t("dictionary.description")}
          color="#6a9c89"
        ></LinkArea>
        <LinkArea
          href="/alphabet"
          name={t("alphabet.name")}
          description={t("alphabet.description")}
          color="#dd7486"
        ></LinkArea>
        <LinkArea
          href="/decks"
          name={t("memorize.name")}
          description={t("memorize.description")}
          color="#cc9988"
        ></LinkArea>
        <LinkArea
          href="/reading"
          name={t("reading.name")}
          description={t("reading.description")}
          color="#8a7aaa"
        ></LinkArea>
      </div>
    </>
  );
}
