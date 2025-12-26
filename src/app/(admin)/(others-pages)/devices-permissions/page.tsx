import React from "react";
import {generatePageMetadata} from "@/i18n/metadata";
import DevicesPermissionsPageContent from "@/components/pages/DevicesPermissionsPageContent";

export async function generateMetadata() {
    return generatePageMetadata("pages.devicesPermissions");
}
export default function DevicesPage() {
  return <DevicesPermissionsPageContent/>;
}
