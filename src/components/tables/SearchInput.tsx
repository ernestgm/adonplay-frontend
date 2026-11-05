"use client";

import React, { useEffect, useRef } from "react";
import { MdClose, MdSearch } from "react-icons/md";
import Input from "@/components/form/input/InputField";
import { useT } from "@/i18n/I18nProvider";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Modern table search: icon, debounce-friendly controlled input,
 * clear button and a "/" keyboard shortcut to focus it.
 * Emits immediately — debouncing belongs to the caller.
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const t = useT("common.table.filters");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative w-64 sm:w-72 ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted">
        <MdSearch size={20} />
      </span>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-16"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label={t("clear")}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-surface-sunken hover:text-content-primary"
        >
          <MdClose size={16} />
        </button>
      )}
      {value.length === 0 && (
        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line-strong bg-surface-sunken px-1.5 py-0.5 text-[11px] font-medium text-content-muted sm:inline-flex">
          /
        </span>
      )}
    </div>
  );
};

export default SearchInput;
