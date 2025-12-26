import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import DevicesEditPageContent from "@/components/pages/DevicesEditPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.devices");
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <DevicesEditPageContent id={params.id} />;
}
