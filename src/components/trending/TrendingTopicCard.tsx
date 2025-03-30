
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Twitter, Linkedin } from "lucide-react";

interface TrendingTopicCardProps {
  id: string;
  title: string;
  description: string;
  source: "twitter" | "linkedin";
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const TrendingTopicCard = ({
  id,
  title,
  description,
  source,
  onSelect,
  isSelected,
}: TrendingTopicCardProps) => {
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge variant={source === "twitter" ? "default" : "outline"} className={
            source === "twitter" 
              ? "bg-twitter text-white" 
              : "bg-transparent text-linkedin border-linkedin"
          }>
            {source === "twitter" ? (
              <Twitter className="h-3 w-3 mr-1" />
            ) : (
              <Linkedin className="h-3 w-3 mr-1" />
            )}
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button 
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(id)}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrendingTopicCard;
