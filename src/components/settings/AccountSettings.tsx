
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Check } from "lucide-react";
import ApiKeyForm from "./ApiKeyForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  connectToTwitter, 
  isTwitterConnected, 
  connectToLinkedin, 
  isLinkedinConnected,
  getTwitterProfile,
  getLinkedinProfile
} from "@/services/openai";
import OpenRouterModelSelector from "./OpenRouterModelSelector";
import SocialAccountDetails from "./SocialAccountDetails";
import TwitterCredentialsForm from "./TwitterCredentialsForm";
import LinkedInCredentialsForm from "./LinkedInCredentialsForm";

const AccountSettings = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [showConnectSuccess, setShowConnectSuccess] = useState(false);
  const [showLinkedinConnectSuccess, setShowLinkedinConnectSuccess] = useState(false);
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [twitterProfile, setTwitterProfile] = useState<any>(null);
  const [linkedinProfile, setLinkedinProfile] = useState<any>(null);

  // Check if social media accounts are connected on component mount
  useEffect(() => {
    checkTwitterConnection();
    checkLinkedInConnection();
    
    // Load OpenRouter API key
    const savedOpenRouterKey = localStorage.getItem("openrouter-api-key");
    if (savedOpenRouterKey) {
      setOpenRouterApiKey(savedOpenRouterKey);
    }
  }, []);
  
  const checkTwitterConnection = () => {
    const isTwitterConn = isTwitterConnected();
    setTwitterConnected(isTwitterConn);
    
    if (isTwitterConn) {
      setShowConnectSuccess(true);
      setTimeout(() => setShowConnectSuccess(false), 5000);
      
      // Load Twitter profile data
      const profileData = getTwitterProfile();
      setTwitterProfile(profileData);
      console.log("Loaded Twitter profile:", profileData);
    } else {
      setTwitterProfile(null);
    }
  };
  
  const checkLinkedInConnection = () => {
    const isLinkedinConn = isLinkedinConnected();
    setLinkedinConnected(isLinkedinConn);
    
    if (isLinkedinConn) {
      setShowLinkedinConnectSuccess(true);
      setTimeout(() => setShowLinkedinConnectSuccess(false), 5000);
      
      // Load LinkedIn profile data
      const profileData = getLinkedinProfile();
      setLinkedinProfile(profileData);
      console.log("Loaded LinkedIn profile:", profileData);
    } else {
      setLinkedinProfile(null);
    }
  };

  const handleTwitterConnect = async () => {
    if (!twitterConnected) {
      // Check if Twitter credentials are available
      const apiKey = localStorage.getItem("twitter-api-key");
      const apiSecret = localStorage.getItem("twitter-api-secret");
      const accessToken = localStorage.getItem("twitter-access-token");
      const accessSecret = localStorage.getItem("twitter-access-secret");
      
      if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
        toast.error("Twitter API credentials are required", {
          description: "Please provide your Twitter API credentials first"
        });
        return;
      }
      
      const success = await connectToTwitter();
      
      if (success) {
        setTwitterConnected(true);
        setShowConnectSuccess(true);
        setTimeout(() => setShowConnectSuccess(false), 5000);
        
        // Get the Twitter profile right after successful connection
        const profileData = getTwitterProfile();
        setTwitterProfile(profileData);
        console.log("Connected Twitter and loaded profile:", profileData);
        
        toast.success("Twitter Connected", {
          description: "Your Twitter account has been successfully connected."
        });
      }
    } else {
      // Disconnect from Twitter
      localStorage.removeItem("twitter-connected");
      localStorage.removeItem("twitter-profile");
      setTwitterConnected(false);
      setTwitterProfile(null);
      
      toast.success("Twitter Disconnected", {
        description: "Your Twitter account has been disconnected."
      });
    }
  };

  const handleLinkedinConnect = async () => {
    if (!linkedinConnected) {
      // Check if LinkedIn credentials are available
      const clientId = localStorage.getItem("linkedin-client-id");
      const clientSecret = localStorage.getItem("linkedin-client-secret");
      
      if (!clientId || !clientSecret) {
        toast.error("LinkedIn credentials are required", {
          description: "Please provide your LinkedIn Client ID and Secret first"
        });
        return;
      }
      
      const success = await connectToLinkedin();
      
      if (success) {
        setLinkedinConnected(true);
        setShowLinkedinConnectSuccess(true);
        setTimeout(() => setShowLinkedinConnectSuccess(false), 5000);
        
        // Get the LinkedIn profile right after successful connection
        const profileData = getLinkedinProfile();
        setLinkedinProfile(profileData);
        console.log("Connected LinkedIn and loaded profile:", profileData);
        
        toast.success("LinkedIn Connected", {
          description: "Your LinkedIn account has been successfully connected."
        });
      }
    } else {
      // Disconnect from LinkedIn
      localStorage.removeItem("linkedin-connected");
      localStorage.removeItem("linkedin-profile");
      setLinkedinConnected(false);
      setLinkedinProfile(null);
      
      toast.success("LinkedIn Disconnected", {
        description: "Your LinkedIn account has been disconnected."
      });
    }
  };

  const handleTwitterCredentialsSubmit = (apiKey: string, apiSecret: string, accessToken: string, accessSecret: string) => {
    // If any credentials changed, disconnect
    if (twitterConnected) {
      localStorage.removeItem("twitter-connected");
      localStorage.removeItem("twitter-profile");
      setTwitterConnected(false);
      setTwitterProfile(null);
      
      toast.info("Twitter credentials updated", {
        description: "Please reconnect your Twitter account with the new credentials."
      });
    }
  };
  
  const handleLinkedInCredentialsSubmit = (clientId: string, clientSecret: string) => {
    // If any credentials changed, disconnect
    if (linkedinConnected) {
      localStorage.removeItem("linkedin-connected");
      localStorage.removeItem("linkedin-profile");
      setLinkedinConnected(false);
      setLinkedinProfile(null);
      
      toast.info("LinkedIn credentials updated", {
        description: "Please reconnect your LinkedIn account with the new credentials."
      });
    }
  };

  const handleOpenRouterApiKeySubmit = (apiKey: string) => {
    setOpenRouterApiKey(apiKey);
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
          {showConnectSuccess && twitterConnected && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Twitter successfully connected and ready to use
              </AlertDescription>
            </Alert>
          )}
          
          {showLinkedinConnectSuccess && linkedinConnected && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                LinkedIn successfully connected and ready to use
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            <Button 
              className="justify-start" 
              variant={twitterConnected ? "default" : "outline"}
              onClick={handleTwitterConnect}
            >
              <Twitter className="mr-2 h-5 w-5 text-twitter" />
              {twitterConnected ? "Disconnect Twitter Account" : "Connect Twitter Account"}
            </Button>
            
            {twitterConnected && twitterProfile && (
              <SocialAccountDetails platform="twitter" profile={twitterProfile} />
            )}
            
            <Button 
              className="justify-start mt-4" 
              variant={linkedinConnected ? "default" : "outline"}
              onClick={handleLinkedinConnect}
            >
              <Linkedin className="mr-2 h-5 w-5 text-linkedin" />
              {linkedinConnected ? "Disconnect LinkedIn Account" : "Connect LinkedIn Account"}
            </Button>
            
            {linkedinConnected && linkedinProfile && (
              <SocialAccountDetails platform="linkedin" profile={linkedinProfile} />
            )}
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
          <Tabs defaultValue="openrouter" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
              <TabsTrigger value="openai">Claude AI</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openrouter" className="space-y-4 mt-4">
              <ApiKeyForm 
                keyType="openrouter"
                label="OpenRouter API Key"
                placeholder="sk_or_..."
                description="Your OpenRouter API key is stored locally and never sent to our servers."
                onApiKeySubmit={handleOpenRouterApiKeySubmit}
              />
              
              {openRouterApiKey && <OpenRouterModelSelector apiKey={openRouterApiKey} />}
            </TabsContent>
            
            <TabsContent value="openai" className="space-y-4 mt-4">
              <ApiKeyForm 
                keyType="openai"
                label="Claude API Key"
                placeholder="sk-ant-api..."
                description="Your API key is stored locally and never sent to our servers."
                onApiKeySubmit={(key) => {
                  toast.success("Claude API Key Saved", {
                    description: "Your Claude API key has been saved successfully."
                  });
                }}
              />
            </TabsContent>
            
            <TabsContent value="twitter" className="space-y-4 mt-4">
              <TwitterCredentialsForm onSubmit={handleTwitterCredentialsSubmit} />
            </TabsContent>
            
            <TabsContent value="linkedin" className="space-y-4 mt-4">
              <LinkedInCredentialsForm onSubmit={handleLinkedInCredentialsSubmit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
