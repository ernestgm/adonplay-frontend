import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import MonitorDevicesViewPageContent from "@/components/pages/MonitorDevicesViewPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.monitorDevices");
}

export default function EditUserPage() {
  return <MonitorDevicesViewPageContent />;
}
