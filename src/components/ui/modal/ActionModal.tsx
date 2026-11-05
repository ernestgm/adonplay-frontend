import React from "react";
import Button from "@/components/ui/button/Button";

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    actions?: { label: string; onClick: () => void; variant?: "primary" | "outline" }[];
}

const ActionModal: React.FC<ActionModalProps> = ({isOpen, title, message, actions = [], onClose}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
            <div
                className="fixed inset-0 h-full w-full bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="relative bg-surface-raised border border-line rounded-2xl shadow-theme-lg w-96 p-6">
                <h2 className="text-lg font-semibold mb-2 text-content-primary">{title}</h2>
                <p className="text-sm text-content-secondary mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            onClick={action.onClick}
                            variant={action.variant || "primary"}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActionModal;
