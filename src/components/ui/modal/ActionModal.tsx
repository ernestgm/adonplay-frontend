import React from "react";
import Button from "@/components/ui/button/Button";

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    actions?: { label: string; onClick: () => void; variant?: "primary" | "outline" }[];
}

const ActionModal: React.FC<ActionModalProps> = ({isOpen, title, message, actions = []}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
            <div className="bg-white border border-gray-400 rounded-lg shadow-lg w-96 p-6">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
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
