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
  let inputClasses = `focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`;
  } else {
    inputClasses += ` border-gray-300 dark:border-gray-700`;
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
