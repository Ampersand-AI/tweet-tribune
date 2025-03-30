
import React from "react";

interface ToastImageContentProps {
  imageUrl: string;
  platform: "twitter" | "linkedin";
}

const ToastImageContent = ({ imageUrl, platform }: ToastImageContentProps) => {
  return (
    <div className="mt-2">
      <img 
        src={imageUrl} 
        alt={`${platform} post screenshot`} 
        className="rounded-md w-full max-h-32 object-cover"
      />
    </div>
  );
};

export default ToastImageContent;
