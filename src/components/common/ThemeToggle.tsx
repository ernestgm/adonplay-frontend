"use client";

import { useTheme } from "@/context/ThemeContext";
import { useT } from "@/i18n/I18nProvider";
import { useState } from "react";
import { MdComputer, MdDarkMode, MdLightMode } from "react-icons/md";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

const ThemeToggle: React.FC = () => {
  const { preference, setPreference } = useTheme();
  const t = useT("common.theme");
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "light", label: t("light"), icon: <MdLightMode size={18} /> },
    { value: "dark", label: t("dark"), icon: <MdDarkMode size={18} /> },
    { value: "system", label: t("system"), icon: <MdComputer size={18} /> },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="dropdown-toggle flex items-center justify-center w-10 h-10 rounded-lg border border-line-strong text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
        aria-label={t("toggle")}
      >
        <MdLightMode size={20} className="dark:hidden" />
        <MdDarkMode size={20} className="hidden dark:block" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="right-0 w-40"
      >
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            baseClassName="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left text-content-secondary hover:bg-surface-hover hover:text-content-primary"
            onItemClick={() => {
              setPreference(option.value);
              setIsOpen(false);
            }}
          >
            <span className="text-content-muted">{option.icon}</span>
            <span className="flex-1">{option.label}</span>
            {preference === option.value && <span className="signal-dot" />}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
};

export default ThemeToggle;
