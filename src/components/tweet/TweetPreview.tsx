
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TweetPreviewProps {
  tweet: {
    id: string;
    content: string;
    imageUrl: string;
    platform?: "twitter" | "linkedin";
    postUrl?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (id: string, newContent: string) => void;
  onPostNow?: (id: string) => void;
}

const TweetPreview = ({ tweet, isSelected, onSelect, onEdit, onPostNow }: TweetPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(tweet.content);
  const [isPosting, setIsPosting] = useState(false);

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(tweet.id, editedContent);
    }
    setIsEditing(false);
  };

  const handlePostNow = () => {
    if (onPostNow) {
      setIsPosting(true);
      onPostNow(tweet.id);
      // Reset the posting state after a delay
      setTimeout(() => setIsPosting(false), 2000);
    }
  };

  return (
    <Card className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="relative aspect-video">
        <img 
          src={tweet.imageUrl} 
          alt="Tweet preview" 
          className="object-cover w-full h-full"
        />
        {tweet.platform && (
          <div className="absolute top-2 right-2 bg-black/50 p-1 rounded">
            {tweet.platform === "twitter" ? (
              <Twitter className="h-4 w-4 text-twitter" />
            ) : (
              <Linkedin className="h-4 w-4 text-linkedin" />
            )}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea 
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] text-sm"
              maxLength={tweet.platform === "linkedin" ? 700 : 280}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">{tweet.content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {tweet.content.length}/{tweet.platform === "linkedin" ? 700 : 280} characters
            </p>
            {tweet.postUrl && (
              <a 
                href={tweet.postUrl}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-xs text-blue-500 hover:underline mt-1 block"
              >
                View published post
              </a>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isEditing || isPosting}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {onPostNow && !tweet.postUrl && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePostNow}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isPosting}
            >
              {isPosting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                <>
                  {tweet.platform === "linkedin" ? (
                    <Linkedin className="h-4 w-4 mr-1" />
                  ) : (
                    <Twitter className="h-4 w-4 mr-1" />
                  )}
                  Post Now
                </>
              )}
            </Button>
          )}
          {tweet.postUrl && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.open(tweet.postUrl, "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              View Post
            </Button>
          )}
        </div>
        <Button 
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={onSelect}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            "Select"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TweetPreview;
