"use client";

import React from "react";
import { useI18n } from "@/i18n/I18nProvider";

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center rounded-lg border border-line-strong bg-surface-sunken p-0.5 text-sm">
      <button
        type="button"
        className={`px-3 py-1 rounded-md transition-colors ${locale === "en" ? "bg-surface text-content-primary shadow-theme-xs" : "text-content-secondary hover:text-content-primary"}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        className={`px-3 py-1 rounded-md transition-colors ${locale === "es" ? "bg-surface text-content-primary shadow-theme-xs" : "text-content-secondary hover:text-content-primary"}`}
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSwitcher;
