
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { toast as sonnerToast } from "sonner";
import ToastImageContent from "@/components/toast/ToastImageContent";

export function usePostToast() {
  const { toast } = useToast();
  
  const showPostConfirmation = (
    content: string, 
    platform: "twitter" | "linkedin", 
    screenshotUrl: string
  ) => {
    // Generate platform-specific post URL
    const postUrl = platform === "twitter" 
      ? `https://twitter.com/home` 
      : `https://linkedin.com/feed/`;
    
    // First toast - immediate confirmation
    sonnerToast(
      `${platform === "twitter" ? "Tweet" : "LinkedIn post"} published successfully!`,
      {
        description: content.substring(0, 60) + "...",
        action: {
          label: "View",
          onClick: () => window.open(postUrl),
        },
        icon: platform === "twitter" ? "🐦" : "🔗",
        duration: 5000,
      }
    );
    
    // Second toast - with screenshot (after a delay)
    setTimeout(() => {
      sonnerToast(
        `Your ${platform === "twitter" ? "Tweet" : "LinkedIn post"} is now live!`, 
        {
          description: React.createElement(ToastImageContent, { 
            imageUrl: screenshotUrl, 
            platform: platform 
          }),
          action: {
            label: "View Post",
            onClick: () => window.open(postUrl),
          },
          duration: 8000,
        }
      );
    }, 1000);
  };
  
  return { showPostConfirmation };
}
