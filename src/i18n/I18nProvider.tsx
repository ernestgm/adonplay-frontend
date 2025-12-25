"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import en from "@/i18n/messages/en";
import es from "@/i18n/messages/es";

type Messages = Record<string, any>;

interface I18nContextValue {
  locale: string;
  messages: Messages;
  setLocale: (locale: string) => void;
}

const catalogs: Record<string, Messages> = {
  en,
  es,
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children, defaultLocale = "en" }: { children: React.ReactNode; defaultLocale?: string }) {
  const [locale, setLocale] = useState<string>(defaultLocale);

  const value = useMemo<I18nContextValue>(() => {
    const messages = catalogs[locale] || catalogs.en;
    return { locale, messages, setLocale };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

function formatMsg(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function useT(namespace?: string) {
  const { messages } = useI18n();
  return (key: string, vars?: Record<string, string | number>) => {
    const path = namespace ? `${namespace}.${key}` : key;
    const parts = path.split(".");
    let cur: any = messages;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else {
        return formatMsg(key, vars);
      }
    }
    if (typeof cur === "string") return formatMsg(cur, vars);
    return formatMsg(key, vars);
  };
}
