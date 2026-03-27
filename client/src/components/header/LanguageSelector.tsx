import { LANGUAGES } from "../../types";

interface LanguageSelectorProps {
  language: string;
  onChange: (lang: string) => void;
}

export default function LanguageSelector({
  language,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className="px-3 py-1 rounded text-xs transition-all"
          style={
            language === lang
              ? {
                  backgroundColor: "#4a9eda22",
                  color: "#4a9eda",
                  border: "1px solid #4a9eda55",
                  fontWeight: 600,
                }
              : { color: "#6d7374", border: "1px solid transparent" }
          }
        >
          {lang}
        </button>
      ))}
    </div>
  );
}