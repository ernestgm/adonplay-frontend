import React from "react";
import HomePageContent from "@/components/pages/HomePageContent";
import {generatePageMetadata} from "@/i18n/metadata";

export async function generateMetadata() {
    return generatePageMetadata("pages.home");
}

export default function HomePage() {
  return <HomePageContent />;
}
