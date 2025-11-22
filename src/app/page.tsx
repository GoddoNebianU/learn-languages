import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("home");
  function TopArea() {
    return (
      <div className="bg-[#35786f] text-white w-full min-h-[75dvh] flex justify-center items-center">
        <div className="mb-16 mx-16 md:mx-0 md:max-w-[60dvw]">
          <h1 className="text-6xl md:text-9xl mb-8 font-extrabold">
            {t("title")}
          </h1>
          <p className="text-2xl md:text-5xl font-medium">{t("description")}</p>
        </div>
      </div>
    );
  }
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
        className={`h-32 md:h-64 flex md:justify-center items-center`}
      >
        <div className="text-white m-8">
          <h1 className="text-4xl">{name}</h1>
          <p className="text-xl">{description}</p>
        </div>
      </Link>
    );
  }
  function LinkGrid() {
    return (
      <div className="w-full grid grid-cols-1 grid-rows-6 md:grid-cols-3">
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
          href="/alphabet"
          name={t("alphabet.name")}
          description={t("alphabet.description")}
          color="#dd7486"
        ></LinkArea>
        <LinkArea
          href="/memorize"
          name={t("memorize.name")}
          description={t("memorize.description")}
          color="#cc9988"
        ></LinkArea>
        <LinkArea
          href="#"
          name={t("moreFeatures.name")}
          description={t("moreFeatures.description")}
          color="#cab48a"
        ></LinkArea>
      </div>
    );
  }
  function Fortune() {
    return (
      <div className="w-full flex justify-center font-serif items-center flex-col min-h-64 h-[25vdh]">
        <p className="text-3xl">{t("fortune.quote")}</p>
        <cite className="text-[#e9b353] text-xl">{t("fortune.author")}</cite>
      </div>
    );
  }
  function Explore() {
    return (
      <div className="bg-[#bbbbbb] w-full flex justify-center items-center flex-col h-52">
        <span className="text-[100px] text-white">{t("explore")}</span>
        <div className="w-0 h-0 border-l-40 border-r-40 border-t-30 border-l-transparent border-r-transparent border-t-white"></div>
      </div>
    );
  }
  return (
    <>
      <TopArea></TopArea>
      <Fortune></Fortune>
      <Explore></Explore>
      <LinkGrid></LinkGrid>
    </>
  );
}
