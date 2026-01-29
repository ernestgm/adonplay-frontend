"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Modal } from "@/components/ui/modal";

interface ExpandableImageProps extends ImageProps {
  containerClassName?: string;
}

const ExpandableImage: React.FC<ExpandableImageProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { containerClassName, ...imageProps } = props;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div 
        className={`cursor-zoom-in ${containerClassName || ""}`} 
        onClick={toggleExpand}
      >
        <Image {...imageProps} />
      </div>

      <Modal 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)}
        className="max-w-[90vw] max-h-[90vh] !bg-transparent !p-0"
        showCloseButton={true}
      >
        <div 
          className="flex items-center justify-center w-full h-full cursor-zoom-out"
          onClick={() => setIsExpanded(false)}
        >
          <img
            src={typeof props.src === 'string' ? props.src : ''}
            alt={props.alt || "Expanded image"}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
};

export default ExpandableImage;
