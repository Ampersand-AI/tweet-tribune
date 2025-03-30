
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin } from "lucide-react";
import ApiKeyForm from "./ApiKeyForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AccountSettings = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  const handleTwitterConnect = () => {
    // In a real app, this would trigger OAuth flow
    // For now, we'll just toggle the state
    setTwitterConnected(!twitterConnected);
    
    if (!twitterConnected) {
      toast.success("Twitter Connected", {
        description: "Your Twitter account has been successfully connected."
      });
    } else {
      toast.success("Twitter Disconnected", {
        description: "Your Twitter account has been disconnected."
      });
    }
  };

  const handleLinkedinConnect = () => {
    // Same placeholder for LinkedIn
    setLinkedinConnected(!linkedinConnected);
    
    if (!linkedinConnected) {
      toast.success("LinkedIn Connected", {
        description: "Your LinkedIn account has been successfully connected."
      });
    } else {
      toast.success("LinkedIn Disconnected", {
        description: "Your LinkedIn account has been disconnected."
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
          <CardDescription>
            Connect your social media accounts to enable posting and trending topic fetching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              className="justify-start" 
              variant={twitterConnected ? "default" : "outline"}
              onClick={handleTwitterConnect}
            >
              <Twitter className="mr-2 h-5 w-5 text-twitter" />
              {twitterConnected ? "Disconnect Twitter Account" : "Connect Twitter Account"}
            </Button>
            <Button 
              className="justify-start" 
              variant={linkedinConnected ? "default" : "outline"}
              onClick={handleLinkedinConnect}
            >
              <Linkedin className="mr-2 h-5 w-5 text-linkedin" />
              {linkedinConnected ? "Disconnect LinkedIn Account" : "Connect LinkedIn Account"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="openai">Claude AI</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4 mt-4">
              <ApiKeyForm 
                keyType="openai"
                label="Claude API Key"
                placeholder="sk-ant-api..."
                description="Your API key is stored locally and never sent to our servers."
                onApiKeySubmit={(key) => console.log("Claude API key saved")}
              />
            </TabsContent>
            
            <TabsContent value="twitter" className="space-y-4 mt-4">
              <ApiKeyForm 
                keyType="twitter"
                label="Twitter API Key"
                placeholder="Enter your Twitter API Key"
                description="Required for posting tweets and fetching analytics."
                onApiKeySubmit={(key) => console.log("Twitter API key saved")}
              />
              
              <ApiKeyForm 
                keyType="twitter-secret"
                label="Twitter API Key Secret"
                placeholder="Enter your Twitter API Key Secret"
                description="Required alongside your Twitter API Key."
                onApiKeySubmit={(key) => console.log("Twitter API secret saved")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
