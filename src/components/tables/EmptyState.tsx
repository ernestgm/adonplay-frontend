import React from "react";
import { MdSearchOff } from "react-icons/md";
import { useT } from "@/i18n/I18nProvider";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

/** Friendly empty state shown when a table has no rows to display. */
const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  const t = useT("common.table.states");

  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-active text-brand-500">
        <MdSearchOff size={24} />
      </span>
      <p className="mt-4 text-sm font-medium text-content-primary">
        {title || t("emptyTitle")}
      </p>
      <p className="mt-1 text-sm text-content-secondary">
        {description || t("emptyDescription")}
      </p>
    </div>
  );
};

export default EmptyState;
