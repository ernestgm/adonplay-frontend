import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import SlidesMediaManagementPageContent from "@/components/pages/SlidesMediaManagementPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.slides");
}

export default function SlidesMediaManagementPage() {
  return <SlidesMediaManagementPageContent />;
}

