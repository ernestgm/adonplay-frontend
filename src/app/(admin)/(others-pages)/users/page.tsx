import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import UsersPageContent from "@/components/pages/UsersPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.users");
}
export default function UsersPage() {
  return <UsersPageContent/>;
}
