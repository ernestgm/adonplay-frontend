import React from "react";
import type { Metadata } from "next";
import MenuValuesPageContent from "@/components/pages/MenuValuesPageContent";

export const metadata: Metadata = {
  title: `Valores del formmenu | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
  description: "Edita precios y disponibilidad de un formmenu.",
};

export default function MenuValuesPage() {
  return <MenuValuesPageContent />;
}
