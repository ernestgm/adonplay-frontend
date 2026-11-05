import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  disabledPlaceholder?: boolean;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string; // Optional hint text
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
                                         disabledPlaceholder = true,
  onChange,
  className = "",
  defaultValue = "",
   success = false,
                                         disabled = false,
   error = false,
   hint,
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value); // Trigger parent handler
  };

  let inputClasses = `h-11 w-full rounded-lg border appearance-none pl-4 pr-8 py-2.5 text-sm shadow-theme-xs placeholder:text-content-muted focus:outline-hidden focus:ring-3 bg-surface text-content-primary border-line-strong focus:border-brand-400 focus:ring-brand-500/10 ${className}`;

  // Add styles for the different states
  if (disabled) {
    inputClasses += ` text-content-muted border-line-strong bg-surface-sunken cursor-not-allowed opacity-60`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300  dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` border-line-strong`;
  }

  if (!selectedValue) {
    inputClasses += ` text-content-muted`;
  }

  return (
      <>
    <select
      value={selectedValue}
      onChange={handleChange}
      disabled={disabled}
      className={inputClasses}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled={disabledPlaceholder}
        className="text-content-primary bg-surface-raised"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-content-primary bg-surface-raised"
        >
          {option.label}
        </option>
      ))}
    </select>
      {/* Optional Hint Text */}
      {hint && (
          <p
              className={`absolute mt-1.5 text-xs ${
                  error
                      ? "text-error-500"
                      : success
                          ? "text-success-500"
                          : "text-gray-500"
              }`}
          >
            {hint}
          </p>
      )}
      </>
  );
};

export default Select;
