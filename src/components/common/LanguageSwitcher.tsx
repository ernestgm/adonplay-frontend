"use client";

import React from "react";
import { useI18n } from "@/i18n/I18nProvider";

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-fuchsia-900/70 p-1 text-sm text-white shadow">
      <button
        type="button"
        className={`px-3 py-1 rounded ${locale === "en" ? "bg-white text-gray-900" : "hover:bg-white/10"}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        className={`px-3 py-1 rounded ${locale === "es" ? "bg-white text-gray-900" : "hover:bg-white/10"}`}
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSwitcher;
