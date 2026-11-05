import React from "react";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/** Placeholder bars shown while a table is loading. */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div aria-busy="true" className="w-full space-y-4 p-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-6">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 animate-pulse rounded bg-surface-sunken motion-reduce:animate-none ${
                colIndex === 0 ? "w-1/4" : "flex-1"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
