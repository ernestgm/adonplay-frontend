import type { Metadata } from "next";
import { cookies } from "next/headers";
import en from "@/i18n/messages/en";
import es from "@/i18n/messages/es";

function formatMsg(template: string, vars?: Record<string, string | number>) {
  if (!template) return "";
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export async function generatePageMetadata(ns: string): Promise<Metadata> {
  // Read locale from cookie on the server
  const locale = (await cookies()).get("locale")?.value || "en";
  const catalogs: Record<string, any> = { en, es };
  const messages = catalogs[locale] || catalogs.en;

  // Traverse messages using namespace like "pages.devices"
  const parts = ns.split(".");
  let node: any = messages;
  for (const p of parts) {
    if (node && typeof node === "object") node = node[p];
  }
  const app = process.env.NEXT_PUBLIC_NAME_PAGE || "App";
  const titleTpl = node?.meta?.title || `${parts.at(-1)} | ${app}`;
  const descTpl = node?.meta?.description || `This is ${parts.at(-1)} page in ${app}`;
  const title = formatMsg(titleTpl, { app });
  const description = formatMsg(descTpl, { app });

  return { title, description } satisfies Metadata;
}
