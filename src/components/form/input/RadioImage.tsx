import React from "react";

interface RadioImageProps {
    id: string; // Unique ID for the radio button
    name: string; // Radio group name
    value: string; // Value of the radio button
    checked: boolean; // Whether the radio button is checked
    label: string; // Label for the radio button
    onChange: (value: string) => void; // Handler for value change
    className?: string; // Optional additional classes
    disabled?: boolean;
    image?: any// Optional disabled state for the radio button
}

const RadioImage: React.FC<RadioImageProps> = ({
                                                   id,
                                                   name,
                                                   value,
                                                   checked,
                                                   label,
                                                   onChange,
                                                   className = "",
                                                   disabled = false,
                                                   image = null
                                               }) => {
    return (
        <label>
            <input
                id={id}
                name={name}
                type="radio"
                value={value}
                checked={checked}
                onChange={() => !disabled && onChange(value)} // Prevent onChange when disabled
                className="sr-only radio-input"
                disabled={disabled} // Disable input
            />
            <span className="radio-tile">
					<span className="radio-icon">
                        {image}
                    </span>
					<span className="radio-label">{label}</span>
				</span>
        </label>
)
    ;
};

export default RadioImage;
