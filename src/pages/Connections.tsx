import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Twitter, Linkedin } from "lucide-react";

const Connections = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [twitterApiKey, setTwitterApiKey] = useState("");
  const [twitterApiSecret, setTwitterApiSecret] = useState("");
  const [linkedinClientId, setLinkedinClientId] = useState("");
  const [linkedinClientSecret, setLinkedinClientSecret] = useState("");

  const handleSaveTwitter = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Twitter API key validation and storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Twitter credentials saved successfully!");
    } catch (error) {
      toast.error("Failed to save Twitter credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLinkedIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement LinkedIn API key validation and storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("LinkedIn credentials saved successfully!");
    } catch (error) {
      toast.error("Failed to save LinkedIn credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Social Media Connections</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to enable analysis features
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Twitter className="h-6 w-6 text-blue-400" />
              <div>
                <CardTitle>Twitter API</CardTitle>
                <CardDescription>
                  Connect your Twitter account using API credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-api-key">API Key</Label>
                <Input
                  id="twitter-api-key"
                  type="password"
                  value={twitterApiKey}
                  onChange={(e) => setTwitterApiKey(e.target.value)}
                  placeholder="Enter your Twitter API Key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-api-secret">API Secret</Label>
                <Input
                  id="twitter-api-secret"
                  type="password"
                  value={twitterApiSecret}
                  onChange={(e) => setTwitterApiSecret(e.target.value)}
                  placeholder="Enter your Twitter API Secret"
                />
              </div>
            </div>
            <Button onClick={handleSaveTwitter} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Twitter Credentials"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Linkedin className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>LinkedIn API</CardTitle>
                <CardDescription>
                  Connect your LinkedIn account using API credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin-client-id">Client ID</Label>
                <Input
                  id="linkedin-client-id"
                  type="password"
                  value={linkedinClientId}
                  onChange={(e) => setLinkedinClientId(e.target.value)}
                  placeholder="Enter your LinkedIn Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-client-secret">Client Secret</Label>
                <Input
                  id="linkedin-client-secret"
                  type="password"
                  value={linkedinClientSecret}
                  onChange={(e) => setLinkedinClientSecret(e.target.value)}
                  placeholder="Enter your LinkedIn Client Secret"
                />
              </div>
            </div>
            <Button onClick={handleSaveLinkedIn} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save LinkedIn Credentials"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Connections; 