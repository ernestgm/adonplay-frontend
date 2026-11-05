"use client";

import React from "react";
import ModuleCard from "@/components/pages/home/ModuleCard";
import {
    MdOutlineBusinessCenter,
    MdOutlineQrCode2,
    MdOutlineTextRotationNone,
    MdOutlineTv,
    MdOutlineVideoLibrary,
    MdOutlineViewCarousel,
    MdOutlineSupervisedUserCircle,
} from "react-icons/md";
import {TbDeviceDesktopAnalytics, TbDeviceImacCheck} from "react-icons/tb";
import {useT} from "@/i18n/I18nProvider";
import {getDataUserAuth} from "@/server/api/auth";

interface Module {
    key: string;
    path: string;
    icon: React.ReactNode;
    roles: string[];
}

const modules: Module[] = [
    {
        key: "business",
        path: "/business",
        icon: <MdOutlineBusinessCenter size={26}/>,
        roles: ["admin", "owner"],
    },
    {
        key: "media",
        path: "/media-library",
        icon: <MdOutlineVideoLibrary size={26}/>,
        roles: ["admin", "owner"],
    },
    {
        key: "slides",
        path: "/slides",
        icon: <MdOutlineViewCarousel size={26}/>,
        roles: ["admin", "owner"],
    },
    {
        key: "marquees",
        path: "/marquees",
        icon: <MdOutlineTextRotationNone size={26}/>,
        roles: ["admin", "owner"],
    },
    {
        key: "qrs",
        path: "/qrcodes",
        icon: <MdOutlineQrCode2 size={26}/>,
        roles: ["admin", "owner"],
    },
    {
        key: "devices",
        path: "/devices",
        icon: <MdOutlineTv size={26}/>,
        roles: ["admin", "owner"],
    },
    {
        key: "users",
        path: "/users",
        icon: <MdOutlineSupervisedUserCircle size={26}/>,
        roles: ["admin"],
    },
    {
        key: "devicesPermissions",
        path: "/devices-permissions",
        icon: <TbDeviceImacCheck size={26}/>,
        roles: ["admin"],
    },
    {
        key: "monitor",
        path: "/monitor-devices",
        icon: <TbDeviceDesktopAnalytics size={26}/>,
        roles: ["admin"],
    },
];

const HomePageContent: React.FC = () => {
    const t = useT("common.nav");
    const tModuleDesc = useT("pages.home.modules");
    const tPage = useT("pages.home.adminPanel");

    const userData = getDataUserAuth();
    const userRole = userData?.role || "";

    const visibleModules = modules.filter(
        (module) => module.roles.includes(userRole)
    );

    return (
        <>
            <header className="mb-10">
                <h1 className="text-3xl font-semibold text-content-primary">
                    {tPage("title")}
                </h1>
                <p className="mt-2 text-content-secondary">
                    {tPage("subtitle")}
                </p>
            </header>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visibleModules.map((module) => (
                    <ModuleCard
                        key={module.key}
                        title={t(module.key)}
                        description={tModuleDesc(module.key)}
                        icon={module.icon}
                        link={module.path}
                    />
                ))}
            </div>
        </>
    );
};

export default HomePageContent;
