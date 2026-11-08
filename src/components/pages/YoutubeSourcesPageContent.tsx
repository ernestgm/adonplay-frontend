"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import YoutubeSourcesTable from "@/components/app/youtube/tables/YoutubeSourcesTable";
import {useT} from "@/i18n/I18nProvider";

export default function YoutubeSourcesPageContent() {
  const t = useT("pages.youtubeSources");
  return <div><PageBreadcrumb pageTitle={t("pageTitle")} /><div className="space-y-6"><ComponentCard title={t("cardTitle")}><YoutubeSourcesTable /></ComponentCard></div></div>;
}
