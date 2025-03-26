import dateLocales from "@/i18n/dateLocals";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Language } from "../hooks/useLanguageCanister";
import { defaultLanguage, useLanguageCanister } from "../hooks/useLanguageCanister";
import { useNewsCanister } from "../hooks/useNewsCanister";
interface Tags {
  name: string;
}

interface Category {
  name: string;
}

interface CommonContextType {
  tags: Tags[];
  categories: Category[];
  languages: Language[];
  language: Language;
  currentLocale: (typeof dateLocales)["en"];
  setLanguage: (language: Language) => void;
}
const CommonContext = createContext<CommonContextType | undefined>(undefined);

export function CommonContextProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [tags, setTags] = useState<Tags[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { getTags, getCategories } = useNewsCanister();
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      const parsedLanguage = JSON.parse(savedLanguage);
      setLanguage(parsedLanguage);
      // Update i18next language
      i18n.changeLanguage(parsedLanguage.language_code);
    }
  }, []);
  const { languages } = useLanguageCanister();
  useEffect(() => {
    (async () => {
      const fetchData = async () => {
        try {
          const tags = await getTags();
          const categories = await getCategories();
          setTags(tags);
          setCategories(categories);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      };
      fetchData();
    })();
  }, [getTags, getCategories]);

  // Custom language setter that also updates i18next
  const handleSetLanguage = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    // Save language to localStorage
    localStorage.setItem("language", JSON.stringify(selectedLanguage));
    // Update i18next language
    i18n.changeLanguage(selectedLanguage.language_code);
  };
  const currentLocale = useMemo(
    () => dateLocales[language.language_code as keyof typeof dateLocales] || dateLocales["en"],
    [language.language_code]
  );
  return (
    <CommonContext.Provider
      value={{
        tags,
        categories,
        languages,
        language,
        currentLocale,
        setLanguage: handleSetLanguage,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
}

export function useCommonContext() {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error("useCommonContext must be used within a CommonContextProvider");
  }
  return context;
}
