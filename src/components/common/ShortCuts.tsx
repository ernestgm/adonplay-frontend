import React from "react";
import SingleCard from "@/components/common/SingleCard";

interface ShortCutsProps {
    icon?: React.ReactNode;
  title?: string;
  link?: string;
  className?: string; // Additional custom classes for styling
}

const ShortCuts: React.FC<ShortCutsProps> = ({
  icon,
    title,
    link,
  className = "",
}) => {
  return (
      <SingleCard>
          <a href={ link ? link : '#' }
             className="glass-card p-4 rounded-2xl flex flex-col items-center text-center group">
              <div className="bg-blue-500/20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  { icon }
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
          </a>
      </SingleCard>
  );
};

export default ShortCuts;
