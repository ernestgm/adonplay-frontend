"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useParams, useRouter } from "next/navigation";
import { useError } from "@/context/ErrorContext";
import { getSlide } from "@/server/api/slides";
import MenuEditorForm from "@/components/app/menus/MenuEditorForm";

const EditMenuPageContent: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const setError = useError().setError;
  const [slide, setSlide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSlide(params.id);
        if (data?.layout !== "menu") {
          setError("El slide seleccionado no es un formmenu.");
          router.push("/menus");
          return;
        }
        setSlide(data);
      } catch (err: any) {
        setError(err.data?.message || err.message || "No se pudo cargar el formmenu.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router, setError]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Editar formmenu" onBack={() => router.push("/menus")} />
      {loading ? (
        <p className="text-content-muted">Cargando formmenu...</p>
      ) : slide ? (
        <MenuEditorForm slide={slide} />
      ) : null}
    </div>
  );
};

export default EditMenuPageContent;
