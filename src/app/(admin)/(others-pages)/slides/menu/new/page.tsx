import React from "react";
import type { Metadata } from "next";
import CreateMenuPageContent from "@/components/pages/CreateMenuPageContent";

export const metadata: Metadata = {
  title: `Crear formmenu | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
  description: "Crea un formmenu con imagen de fondo, cuadrícula y precios.",
};

export default function CreateMenuPage() {
  return <CreateMenuPageContent />;
}
