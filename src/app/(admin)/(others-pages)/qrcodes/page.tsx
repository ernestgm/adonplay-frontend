import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import QrCodesPageContent from "@/components/pages/QrCodesPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.qrcodes");
}

export default function QrCodesPage() {
  return <QrCodesPageContent/>;
}

