"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {useParams, useRouter} from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { useError } from "@/context/ErrorContext";
import { getSlideMedias } from "@/server/api/slidesMedia";
import SlideMediaDetails from "@/components/app/slides/details/SlideMediaDetails";

const SlidesMediaDetailsPageContent = () => {
    const params = useParams();
    const slideId = params.id; // Get the slide ID from the URL
    const mediaId = params.mediaId;
    const router = useRouter();
  const tActions = useT("common.table.actions");
  const tStates = useT("common.table.states");
  const setError = useError().setError;

  const [loading, setLoading] = useState(true);
  const [slideMedia, setSlideMedia] = useState<any>(null);

  const handleBack = () => {
    router.push(`/slides/media-management/${slideId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSlideMedias(mediaId);
        setSlideMedia(data);
      } catch (err: any) {
        setError(err.data?.message || err.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mediaId, setError]);

  if (loading) return <div>{tStates("loading")}</div>;

  const title = `${tActions("mediaManagement")} · ${tActions("view")}`;

  return (
    <div>
      <PageBreadcrumb pageTitle={title} onBack={handleBack} />
      {slideMedia && <SlideMediaDetails slideMedia={slideMedia} />}
    </div>
  );
};

export default SlidesMediaDetailsPageContent;
