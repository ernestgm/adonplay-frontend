"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams} from "next/navigation";
import {getSlide} from "@/server/api/slides";
import SlidesForm from "@/components/app/slides/form/SlidesForm";
import MediaTable from "@/components/app/slides/tables/MediaTables";

const SlidesEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL

    return (
        <div>
            <PageBreadcrumb pageTitle="Editar Slide"/>
            <MediaTable slide={id} />
        </div>
    );
};

export default SlidesEditPage;

