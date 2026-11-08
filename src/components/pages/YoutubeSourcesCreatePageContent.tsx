"use client";

import React from "react";
import {useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import YoutubeSourceForm from "@/components/app/youtube/form/YoutubeSourceForm";
import {useT} from "@/i18n/I18nProvider";

export default function YoutubeSourcesCreatePageContent() {
  const router = useRouter();
  const t = useT("pages.youtubeSources");
  return <div><PageBreadcrumb pageTitle={t("createPageTitle")} onBack={() => router.push("/youtube")} /><YoutubeSourceForm /></div>;
}
