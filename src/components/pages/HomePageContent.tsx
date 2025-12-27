"use client";

import React from "react";
import ShortCuts from "@/components/common/ShortCuts";
import {
    MdOutlineBusinessCenter, MdOutlineQrCode2,
    MdOutlineTextRotationNone, MdOutlineTv,
    MdOutlineVideoLibrary,
    MdOutlineViewCarousel
} from "react-icons/md";
import {useT} from "@/i18n/I18nProvider";

const HomePageContent: React.FC = () => {
    const t = useT("common.nav");
    const tPage = useT("pages.home.adminPanel");
    return (
        <>
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-blue-950 mb-2">
                    {tPage("title")}
                </h1>
                <p className="text-slate-400">
                    {tPage("subtitle")}
                </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ShortCuts
                    title={t("business")}
                    icon={<MdOutlineBusinessCenter size={35}/>}
                    link="/business"
                />

                <ShortCuts
                    title={t("media")}
                    icon={<MdOutlineVideoLibrary size={35}/>}
                    link="/media-library"
                />

                <ShortCuts
                    title={t("slides")}
                    icon={<MdOutlineViewCarousel size={35}/>}
                    link="/slides"
                />

                <ShortCuts
                    title={t("marquees")}
                    icon={<MdOutlineTextRotationNone size={35}/>}
                    link="/marquees"
                />

                <ShortCuts
                    title={t("qrs")}
                    icon={<MdOutlineQrCode2 size={35}/>}
                    link="/qrcodes"
                />

                <ShortCuts
                    title={t("devices")}
                    icon={<MdOutlineTv size={50}/>}
                    link="/devices"
                />
            </div>
        </>
    );
};

export default HomePageContent;
