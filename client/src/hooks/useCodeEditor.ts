import { useState } from "react";
import { DEFAULT_CODE } from "../types";

export function useCodeEditor() {
  const [language, setLanguage] = useState("python");

  const [code, setCode] = useState(DEFAULT_CODE["python"]);

  const [codeMap, setCodeMap] = useState<Record<string, string>>({
    ...DEFAULT_CODE,
  });

  const handleLanguageChange = (lang: string) => {
    setCodeMap((prev) => ({ ...prev, [language]: code }));
    setLanguage(lang);
    setCode(codeMap[lang]);
  };

  return { language, code, setCode, handleLanguageChange };
}