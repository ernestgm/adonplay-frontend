"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {useParams, useRouter} from "next/navigation";
import { useError } from "@/context/ErrorContext";
import { getSlide } from "@/server/api/slides";
import SlidesForm from "@/components/app/slides/form/SlidesForm";
import { useT } from "@/i18n/I18nProvider";

const SlidesSettingsPageContent = () => {
    const params = useParams();
    const id = params.id; // Get the slide ID from the URL
  const router = useRouter();
  const setError = useError().setError;
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState<any>(null);

  const tStates = useT("common.table.states");
  const tPage = useT("pages.slides");

  const handleBack = () => {
    router.push(`/slides`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSlide(id);
        setSlide(data);
      } catch (err: any) {
        setError(err.data?.message || err.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, setError]);

  if (loading) {
    return <div>{tStates("loading")}</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("editPageTitle")} onBack={handleBack} />
      <SlidesForm slides={slide} />
    </div>
  );
};

export default SlidesSettingsPageContent;
