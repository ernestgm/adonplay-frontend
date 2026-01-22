"use client";
import React, {useEffect, useRef, useState, useCallback} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {useSidebar} from "../context/SidebarContext";
import {
    ChevronDownIcon,
    HorizontaLDots,
} from "../icons/index";
import {getCurrentLocale, getDataUserAuth} from "@/server/api/auth";
import {
    MdOutlineBusinessCenter,
    MdOutlineGridView,
    MdOutlineQrCode2, MdOutlineSupervisedUserCircle, MdOutlineTextRotationNone, MdOutlineTv,
    MdOutlineVideoLibrary, MdOutlineViewCarousel
} from "react-icons/md";
import {TbDeviceDesktopAnalytics, TbDeviceImacCheck} from "react-icons/tb";
import {cookies} from "next/headers"; // Importar nookies para manejar cookies

type NavItem = {
    name: { es: string; en: string };
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
    roles?: string[]; // Nuevo parámetro para controlar los roles
};

const navItems: NavItem[] = [
    {
        icon: <MdOutlineGridView size={25}/>,
        name: {es: "Inicio", en: "Home"},
        path: "/",
        roles: ["admin", "owner"], // Ejemplo de roles
    },
    {
        icon: <MdOutlineBusinessCenter size={25}/>,
        name: {es: "Administrar Negocios", en: "Business Management"},
        path: "/business",
        roles: ["admin", "owner"],
    },
    {
        icon: <MdOutlineVideoLibrary size={25}/>,
        name: {es: "Libreria de Medios", en: "Media Library"},
        path: "/media-library",
        roles: ["admin", "owner"],
    },
    {
        icon: <MdOutlineViewCarousel size={25}/>,
        name: {es: "Administrar Slides", en: "Slides Management"},
        path: "/slides",
        roles: ["admin", "owner"],
    },
    {
        icon: <MdOutlineTextRotationNone size={25}/>,
        name: {es: "Administrar Marquees", en: "Marquees Management"},
        path: "/marquees",
        roles: ["admin", "owner"],
    },
    {
        icon: <MdOutlineQrCode2 size={25}/>,
        name: {es: "Administrar Codigos QR", en: "Qrs Code Management"},
        path: "/qrcodes",
        roles: ["admin", "owner"],
    },
    {
        icon: <MdOutlineTv size={25}/>,
        name: {es: "Administrar Dispositivos", en: "Devices Management"},
        path: "/devices",
        roles: ["admin", "owner"],
    },
];

const othersItems: NavItem[] = [
    {
        icon: <MdOutlineSupervisedUserCircle size={25}/>,
        name: {es: "Administrar Usuarios", en: "User Management"},
        path: "/users",
        roles: ["admin"],
    },
    {
        icon: <TbDeviceImacCheck size={25}/>,
        name: {es: "Habilitar Dispositivos", en: "Devices Permissions"},
        path: "/devices-permissions",
        roles: ["admin"],
    },
    {
        icon: <TbDeviceDesktopAnalytics size={25}/>,
        name: {es: "Monitorear Dispositivos", en: "Monitor Devices"},
        path: "/monitor-devices",
        roles: ["admin"],
    },
];

const AppSidebar: React.FC = () => {
    const {isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar, toggleMobileSidebar} = useSidebar();
    const pathname = usePathname();

    // Extraer el role del usuario autenticado desde la cookie
    const userData = getDataUserAuth()
    const userRole = userData?.role || ""; // Obtener el primer rol del usuario
    const locale = getCurrentLocale();


    const handleToggle = () => {
        if (window.innerWidth >= 1024) {
            toggleSidebar();
        } else {
            toggleMobileSidebar();
        }
    };
    const renderMenuItems = (
        navItems: NavItem[],
        menuType: "main" | "others",
        lang: string = "en",
        userRoles: string[] // Roles del usuario
    ) => (
        <ul className="flex flex-col gap-4">
            {navItems
                .filter((nav) => !nav.roles || nav.roles.some((role) => userRoles.includes(role))) // Filtrar por roles
                .map((nav, index) => (
                    <li key={index}>
                        {nav.subItems ? (
                            <button
                                onClick={() => handleSubmenuToggle(index, menuType)}
                                className={`menu-item group  ${
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? "menu-item-active"
                                        : "menu-item-inactive"
                                } cursor-pointer ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "lg:justify-start"
                                }`}
                            >
                <span
                    className={` ${
                        openSubmenu?.type === menuType && openSubmenu?.index === index
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span
                                        className={`menu-item-text`}>{lang === "en" ? nav.name.en : nav.name.es}</span>
                                )}
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <ChevronDownIcon
                                        className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                                            openSubmenu?.type === menuType &&
                                            openSubmenu?.index === index
                                                ? "rotate-180 text-brand-500"
                                                : ""
                                        }`}
                                    />
                                )}
                            </button>
                        ) : (
                            nav.path && (
                                <Link
                                    href={nav.path}
                                    onClick={handleToggle}
                                    className={`menu-item group ${
                                        isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                    }`}
                                >
                  <span
                      className={`${
                          isActive(nav.path)
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span
                                            className={`menu-item-text`}>{lang === "en" ? nav.name.en : nav.name.es}</span>
                                    )}
                                </Link>
                            )
                        )}
                        {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[`${menuType}-${index}`] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height:
                                        openSubmenu?.type === menuType && openSubmenu?.index === index
                                            ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                            : "0px",
                                }}
                            >
                                <ul className="mt-2 space-y-1 ml-9">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                href={subItem.path}
                                                onClick={handleToggle}
                                                className={`menu-dropdown-item ${
                                                    isActive(subItem.path)
                                                        ? "menu-dropdown-item-active"
                                                        : "menu-dropdown-item-inactive"
                                                }`}
                                            >
                                                {subItem.name}
                                                <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                              <span
                                  className={`ml-auto ${
                                      isActive(subItem.path)
                                          ? "menu-dropdown-badge-active"
                                          : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge `}
                              >
                              new
                            </span>
                          )}
                                                    {subItem.pro && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(subItem.path)
                                                                    ? "menu-dropdown-badge-active"
                                                                    : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge `}
                                                        >
                              pro
                            </span>
                                                    )}
                        </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
        </ul>
    );

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "main" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {}
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // const isActive = (path: string) => path === pathname;
    const isActive = useCallback((path: string) => path === pathname, [pathname]);

    useEffect(() => {
        // Check if the current path matches any submenu item
        let submenuMatched = false;
        ["main", "others"].forEach((menuType) => {
            const items = menuType === "main" ? navItems : [];
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as "main" | "others",
                                index,
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        // If no submenu item matches, close the open submenu
        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [pathname, isActive]);

    useEffect(() => {
        // Set the height of the submenu items when the submenu is opened
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return {type: menuType, index};
        });
    };


    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
                isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                        ? "w-[290px]"
                        : "w-[90px]"
            }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-8 flex  ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
            >
                <Link href="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <Image
                                className="dark:hidden"
                                src="/images/logo/logo.png"
                                alt="Logo"
                                width={230}
                                height={40}
                            />
                            <Image
                                className="hidden dark:block"
                                src="/images/logo/logo-dark.png"
                                alt="Logo"
                                width={230}
                                height={40}
                            />
                        </>
                    ) : (
                        <Image
                            src="/images/logo/logo-notext.png"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Menu"
                                ) : (
                                    <HorizontaLDots/>
                                )}
                            </h2>
                            {renderMenuItems(navItems, "main", locale, [userRole])} {/* Pasar los roles aquí */}
                        </div>

                        <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "System Settings"
                                ) : (
                                    <HorizontaLDots/>
                                )}
                            </h2>
                            {renderMenuItems(othersItems, "others", locale, [userRole])}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
