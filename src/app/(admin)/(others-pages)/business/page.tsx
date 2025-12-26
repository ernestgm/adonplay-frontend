import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import BusinessPageContent from "@/components/pages/BusinessPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.business");
}
export default function BusinessPage() {
  return <BusinessPageContent/>;
}

