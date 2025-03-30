
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TweetPreviewProps {
  tweet: {
    id: string;
    content: string;
    imageUrl: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const TweetPreview = ({ tweet, isSelected, onSelect }: TweetPreviewProps) => {
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
        <p className="text-sm">{tweet.content}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {tweet.content.length}/280 characters
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={isSelected ? "default" : "outline"}
          className="w-full"
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
