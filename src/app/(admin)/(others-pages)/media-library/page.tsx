import React from 'react';
import { generatePageMetadata } from "@/i18n/metadata";
import MediaLibraryPageContent from "@/components/pages/MediaLibraryPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.mediaLibrary");
}

export default function MediaLibraryPage() {
  return <MediaLibraryPageContent/>;
}

