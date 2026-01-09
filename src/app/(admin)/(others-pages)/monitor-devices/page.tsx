import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import MonitorDevicesPageContent from "@/components/pages/MonitorDevicesPageContent";

export async function generateMetadata() {
    return generatePageMetadata("pages.monitorDevices");
}
export default function DevicesPage() {
  return <MonitorDevicesPageContent/>;
}
