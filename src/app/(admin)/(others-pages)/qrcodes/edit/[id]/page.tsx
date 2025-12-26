import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import QrCodesEditPageContent from "@/components/pages/QrCodesEditPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.qrcodes");
}

export default function QrCodeEditPage({ params }: { params: { id: string } }) {
  return <QrCodesEditPageContent id={params.id} />;
}

