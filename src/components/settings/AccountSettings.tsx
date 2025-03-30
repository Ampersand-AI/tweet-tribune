
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Check } from "lucide-react";
import ApiKeyForm from "./ApiKeyForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { connectToTwitter, isTwitterConnected, connectToLinkedin, isLinkedinConnected } from "@/services/openai";

const AccountSettings = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [showConnectSuccess, setShowConnectSuccess] = useState(false);
  const [showLinkedinConnectSuccess, setShowLinkedinConnectSuccess] = useState(false);

  // Check if social media accounts are connected on component mount
  useEffect(() => {
    const isTwitterConn = isTwitterConnected();
    setTwitterConnected(isTwitterConn);
    
    const isLinkedinConn = isLinkedinConnected();
    setLinkedinConnected(isLinkedinConn);
    
    // Show success message if already connected
    if (isTwitterConn) {
      setShowConnectSuccess(true);
      setTimeout(() => setShowConnectSuccess(false), 5000);
    }
    
    if (isLinkedinConn) {
      setShowLinkedinConnectSuccess(true);
      setTimeout(() => setShowLinkedinConnectSuccess(false), 5000);
    }
  }, []);

  const handleTwitterConnect = async () => {
    if (!twitterConnected) {
      const success = await connectToTwitter();
      
      if (success) {
        setTwitterConnected(true);
        setShowConnectSuccess(true);
        setTimeout(() => setShowConnectSuccess(false), 5000);
        toast.success("Twitter Connected", {
          description: "Your Twitter account has been successfully connected."
        });
      }
    } else {
      // Disconnect from Twitter
      localStorage.removeItem("twitter-connected");
      setTwitterConnected(false);
      toast.success("Twitter Disconnected", {
        description: "Your Twitter account has been disconnected."
      });
    }
  };

  const handleLinkedinConnect = async () => {
    if (!linkedinConnected) {
      const success = await connectToLinkedin();
      
      if (success) {
        setLinkedinConnected(true);
        setShowLinkedinConnectSuccess(true);
        setTimeout(() => setShowLinkedinConnectSuccess(false), 5000);
        toast.success("LinkedIn Connected", {
          description: "Your LinkedIn account has been successfully connected."
        });
      }
    } else {
      // Disconnect from LinkedIn
      localStorage.removeItem("linkedin-connected");
      setLinkedinConnected(false);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="openai">Claude AI</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            </TabsList>
            
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
              <div className="space-y-4">
                {twitterConnected ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Twitter API key is configured and active
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-amber-600 font-medium">
                    Twitter is not connected. Connect it from the Social Media Accounts section above.
                  </p>
                )}
                
                {twitterConnected && (
                  <p className="text-xs text-muted-foreground">
                    Current API Key: dWbEeB7mH35rRfaeBAyAztDhW
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="linkedin" className="space-y-4 mt-4">
              <div className="space-y-4">
                {linkedinConnected ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      LinkedIn API credentials are configured and active
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-amber-600 font-medium">
                    LinkedIn is not connected. Connect it from the Social Media Accounts section above.
                  </p>
                )}
                
                {linkedinConnected && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Client ID: 776n50wy97k6rn
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Auth Key: WPL_AP1.VrsAeeeyhPxYz7CT.ITUw+Q==
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
