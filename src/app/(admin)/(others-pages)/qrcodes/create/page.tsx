import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import QrCodesCreatePageContent from "@/components/pages/QrCodesCreatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.qrcodes");
}

export default function QrCreatePage() {
  return <QrCodesCreatePageContent/>;
}
