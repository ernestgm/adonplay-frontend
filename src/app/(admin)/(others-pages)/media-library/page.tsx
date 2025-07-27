import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import MediaTable from "@/components/app/media/tables/MediaTables";
import type {Metadata} from "next";
import BusinessTable from "@/components/app/business/tables/BusinessTable";
import ComponentCard from "@/components/common/ComponentCard";

export const metadata: Metadata = {
    title: `Media Library | ${process.env.NAME_PAGE}`,
    description: `This is Media Library Page in ${process.env.NAME_PAGE}`,
};
const SlidesEditPage = () => {

    return (
        <div>
            <PageBreadcrumb pageTitle="Media Library"/>
            <ComponentCard title="Medias">
                <MediaTable />
            </ComponentCard>
        </div>
    );
};

export default SlidesEditPage;

