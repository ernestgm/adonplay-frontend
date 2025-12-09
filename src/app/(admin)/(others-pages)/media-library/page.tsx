import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {Suspense} from 'react';
import MediaTable from "@/components/app/media/tables/MediaTables";
import type {Metadata} from "next";
import ComponentCard from "@/components/common/ComponentCard";

export const metadata: Metadata = {
    title: `Media Library | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Media Library Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
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

