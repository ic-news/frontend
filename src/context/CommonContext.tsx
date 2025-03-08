import { createContext, useContext, useEffect, useRef, useState } from "react";
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
}
const CommonContext = createContext<CommonContextType | undefined>(undefined);

export function CommonContextProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<Tags[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { getTags, getCategories } = useNewsCanister();
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  return <CommonContext.Provider value={{ tags, categories }}>{children}</CommonContext.Provider>;
}

export function useCommonContext() {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error("useCommonContext must be used within a CommonContextProvider");
  }
  return context;
}
