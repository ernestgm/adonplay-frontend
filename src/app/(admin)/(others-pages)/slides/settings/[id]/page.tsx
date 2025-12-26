import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import SlidesSettingsPageContent from "@/components/pages/SlidesSettingsPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.slides");
}

export default function SlidesSettingsPage() {
  return <SlidesSettingsPageContent />;
}

