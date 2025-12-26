import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import UsersEditPageContent from "@/components/pages/UsersEditPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.users");
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <UsersEditPageContent id={params.id} />;
}
