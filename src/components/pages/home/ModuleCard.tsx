import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { MdArrowForward } from "react-icons/md";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  link,
}) => {
  const pathname = usePathname();
  const isActive = pathname === link || pathname.startsWith(`${link}/`);

  return (
    <Link
      href={link}
      className={`group relative flex flex-col rounded-2xl border bg-surface p-6 shadow-theme-xs transition-colors hover:border-brand-300 hover:shadow-card ${
        isActive ? "border-brand-300 dark:border-brand-500/50" : "border-line"
      }`}
    >
      {isActive && <span className="signal-dot absolute right-5 top-5" />}
      <span className="flex size-12 items-center justify-center rounded-xl bg-surface-active text-brand-600 dark:text-brand-400">
        {icon}
      </span>
      <h3 className="mt-5 text-base font-semibold text-content-primary">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-content-secondary">
        {description}
      </p>
      <span className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:opacity-0 dark:text-brand-400">
        <MdArrowForward size={16} />
      </span>
    </Link>
  );
};

export default ModuleCard;
