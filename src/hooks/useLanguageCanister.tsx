import { useEffect, useState } from "react";
import { idlFactory, Language, _SERVICE as ManagerService } from "../canister/ic.news.manager";
import useActor from "./useActor";

export const defaultLanguage: Language = {
  language_code: "en",
  language: "English",
  enabled: true,
  country_code: "US",
};
function useLanguageCanister() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const actor = useActor<ManagerService>({
    canisterId: process.env.REACT_APP_MANAGER_CANISTER_ID as string,
    interfaceFactory: idlFactory,
  });
  useEffect(() => {
    if (!actor) return;
    actor
      .get_languages([true])
      .then((res) => {
        setLanguages([
          defaultLanguage,
          ...res.map((l: Language) => {
            const { updated_at, ...languageWithoutUpdatedAt } = l;
            return languageWithoutUpdatedAt as Language;
          }),
        ]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [actor]);

  return { languages };
}
export { useLanguageCanister };
export type { Language };
