import type React from "react";

interface CheckboxImageProps {
    label?: string;
    checked: boolean;
    className?: string;
    id?: string;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    image?: any;
}

const CheckboxImage: React.FC<CheckboxImageProps> = ({
                                                         label,
                                                         checked,
                                                         id,
                                                         onChange,
                                                         className = "",
                                                         disabled = false,
                                                         image = null,
                                                     }) => {
    return (
        <label className="text-slate-400">
            <input
                id={id}
                type="checkbox"
                className={`h-[1px] opacity-0 overflow-hidden absolute whitespace-nowrap w-[1px] peer 
          ${className}`}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <input type="checkbox"
                   className="h-[1px] opacity-0 overflow-hidden absolute whitespace-nowrap w-[1px] peer"/>
            <span
                className="peer-checked:border-blue-500 peer-checked:shadow-blue-500/10 peer-checked:text-blue-500 peer-checked:before:border-blue-500 peer-checked:before:bg-blue-500 peer-checked:before:opacity-100 peer-checked:before:scale-100 peer-checked:before:content-['✓'] flex flex-row items-center justify-center w-fit h-fit pl-6 pr-3 py-3 rounded-lg shadow-lg transition-all duration-200 cursor-pointer relative border-slate-300 border-[3px] bg-white before:absolute before:block before:w-5 before:h-5 before:border-[3px]  before:rounded-full before:top-1 before:left-1 before:opacity-0 before:transition-transform before:scale-0 before:text-white before:text-xs before:flex before:items-center before:justify-center hover:border-blue-500 hover:before:scale-100 hover:before:opacity-100">
      <span className="transition-all duration-100">
        {image}
      </span>
      <span className="transition-all duration-300 text-center ml-1">{label}</span>
    </span>
        </label>
    );
};

export default CheckboxImage;
