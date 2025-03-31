
import React from "react";

interface ToastImageContentProps {
  imageUrl: string;
  platform: "twitter" | "linkedin";
  postUrl?: string;
}

const ToastImageContent = ({ imageUrl, platform, postUrl }: ToastImageContentProps) => {
  return (
    <div className="mt-2 space-y-2">
      <img 
        src={imageUrl} 
        alt={`${platform} post screenshot`} 
        className="rounded-md w-full max-h-32 object-cover"
      />
      {postUrl && (
        <a 
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline block truncate"
        >
          {postUrl}
        </a>
      )}
    </div>
  );
};

export default ToastImageContent;
