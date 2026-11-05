import React, { FC } from "react";

interface FileInputProps {
  name?: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (event: any) => void;
  error?: boolean;
  hint?: string;
}

const FileInput: FC<FileInputProps> = ({ 
  name, 
  accept, 
  multiple, 
  required, 
  disabled = false,
  className = "", 
  onChange,
  error = false,
  hint
}) => {
  // Determine input styles based on state (disabled, error)
  let inputClasses = `h-11 w-full overflow-hidden rounded-lg border bg-transparent text-sm text-content-secondary shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-line file:bg-surface-sunken file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-content-secondary placeholder:text-content-muted hover:file:bg-surface-hover focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 border-line-strong ${className}`;

  if (disabled) {
    inputClasses += ` text-content-muted border-line-strong bg-surface-sunken cursor-not-allowed opacity-60`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`;
  }

  return (
    <div className="relative">
      <input
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        className={inputClasses}
        onChange={onChange}
      />
      
      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`absolute mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default FileInput;
