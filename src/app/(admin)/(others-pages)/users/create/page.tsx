import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import UsersCreatePageContent from "@/components/pages/UsersCreatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.users");
}

export default function CreateUserPage() {
  return <UsersCreatePageContent/>;
}
