import React from "react";

interface SingleCardProps {
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
}

const SingleCard: React.FC<SingleCardProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Body */}
      <div className="p-4 sm:p-6">
        <div className="m-2">{children}</div>
      </div>
    </div>
  );
};

export default SingleCard;
