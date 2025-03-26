import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useCommonContext } from "@/context/CommonContext";
import { Languages as LanguagesSvg } from "lucide-react";
import React from "react";
import i18n from "../i18n";

export default function Translate() {
  const { languages, language, setLanguage } = useCommonContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageSelect = (selectedLanguage: typeof language) => {
    if (language?.language_code !== selectedLanguage.language_code) {
      setLanguage(selectedLanguage);
      localStorage.setItem("language", JSON.stringify(selectedLanguage));
      i18n.changeLanguage(selectedLanguage.language_code);
    }
    setIsOpen(false);
  };

  return (
    <>
      <HoverCard openDelay={100} closeDelay={200} open={isOpen} onOpenChange={setIsOpen}>
        <HoverCardTrigger asChild>
          <div className="flex items-center ml-auto cursor-pointer">
            <LanguagesSvg className="mr-1" />
          </div>
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-32 p-2">
          <div className="flex flex-col space-y-1">
            {languages.map((l) => (
              <button
                key={l.language_code}
                onClick={() => handleLanguageSelect(l)}
                className={`px-2 py-1.5 text-sm hover:text-[var(--color-primary)] rounded-md text-left ${
                  language?.language_code === l.language_code ? "text-[var(--color-primary)]" : ""
                }`}
              >
                {l.language}
              </button>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </>
  );
}
