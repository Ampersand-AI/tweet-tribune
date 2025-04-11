
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SocialAccountDetailsProps {
  platform: "twitter" | "linkedin";
  profile: {
    name: string;
    username?: string;
    followers: number;
    following?: number;
    profileImage?: string;
  };
}

const SocialAccountDetails = ({ platform, profile }: SocialAccountDetailsProps) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage src={profile.profileImage || ""} alt={profile.name} />
            <AvatarFallback>
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            {profile.username && <p className="text-muted-foreground text-sm">@{profile.username}</p>}
            <div className="flex gap-4 text-sm pt-1">
              <div>
                <span className="font-medium">{profile.followers.toLocaleString()}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </div>
              {profile.following !== undefined && (
                <div>
                  <span className="font-medium">{profile.following.toLocaleString()}</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialAccountDetails;
