import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages as LanguagesSvg } from "lucide-react";
import React from "react";

const Languages = [
  { name: "简体中文", code: "zh-CN" },
  { name: "繁體中文", code: "zh-TW" },
  { name: "Tiếng Việt", code: "vi-VN" },
  { name: "한국어", code: "ko-KR" },
  { name: "日本語", code: "ja-JP" },
  { name: "ภาษาไทย", code: "th-TH" },
  { name: "Türkçe", code: "tr-TR" },
];
export default function Translate() {
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const handleLanguageChange = (language: string) => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en-US",
        includedLanguages: "en,zh-CN,es,fr",
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      document.documentElement
    );
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <LanguagesSvg className="ml-auto" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
            >
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
