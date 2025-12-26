"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useError } from "@/context/ErrorContext";
import { useRouter } from "next/navigation";
import { getMedia } from "@/server/api/media";
import MediaForm from "@/components/app/media/form/MediaForm";
import { useT } from "@/i18n/I18nProvider";

const MediaEditPageContent: React.FC<{ id: string }> = ({ id }) => {
  const setError = useError().setError;
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any>(null);

  const tStates = useT("common.table.states");
  const tPage = useT("pages.mediaLibrary");

  const router = useRouter();
  const handleBack = () => {
    router.push(`/media-library`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMedia(id);
        setMedia(data);
      } catch (err: any) {
        setError(err.data?.message || err.message || "Error Fetch Data. Check your network or server conection");
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
      <MediaForm media={media} />
    </div>
  );
};

export default MediaEditPageContent;
