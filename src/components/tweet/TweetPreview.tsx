
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TweetPreviewProps {
  tweet: {
    id: string;
    content: string;
    imageUrl: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (id: string, newContent: string) => void;
}

const TweetPreview = ({ tweet, isSelected, onSelect, onEdit }: TweetPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(tweet.content);

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(tweet.id, editedContent);
    }
    setIsEditing(false);
  };

  return (
    <Card className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="relative aspect-video">
        <img 
          src={tweet.imageUrl} 
          alt="Tweet preview" 
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea 
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] text-sm"
              maxLength={280}
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
              {tweet.content.length}/280 characters
            </p>
          </>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
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
