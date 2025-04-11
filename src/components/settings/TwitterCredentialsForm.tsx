
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface TwitterCredentialsFormProps {
  onSubmit: (apiKey: string, apiSecret: string, accessToken: string, accessSecret: string) => void;
}

const TwitterCredentialsForm = ({ onSubmit }: TwitterCredentialsFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessSecret, setAccessSecret] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("twitter-api-key");
    const savedApiSecret = localStorage.getItem("twitter-api-secret");
    const savedAccessToken = localStorage.getItem("twitter-access-token");
    const savedAccessSecret = localStorage.getItem("twitter-access-secret");
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiSecret) setApiSecret(savedApiSecret);
    if (savedAccessToken) setAccessToken(savedAccessToken);
    if (savedAccessSecret) setAccessSecret(savedAccessSecret);
    
    if (savedApiKey && savedApiSecret && savedAccessToken && savedAccessSecret) {
      setIsSubmitted(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }
    
    if (!apiSecret.trim()) {
      setError("API Secret is required");
      return;
    }
    
    if (!accessToken.trim()) {
      setError("Access Token is required");
      return;
    }
    
    if (!accessSecret.trim()) {
      setError("Access Token Secret is required");
      return;
    }

    // Save credentials to localStorage
    localStorage.setItem("twitter-api-key", apiKey);
    localStorage.setItem("twitter-api-secret", apiSecret);
    localStorage.setItem("twitter-access-token", accessToken);
    localStorage.setItem("twitter-access-secret", accessSecret);
    
    onSubmit(apiKey, apiSecret, accessToken, accessSecret);
    setError("");
    setIsSubmitted(true);
    
    toast.success("Twitter API Credentials Saved", {
      description: "Your Twitter API credentials have been saved successfully."
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isSubmitted && !error && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Credentials Saved</AlertTitle>
          <AlertDescription className="text-green-600">
            Your Twitter API credentials have been saved and are ready to use.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="twitter-api-key">Twitter API Key</Label>
          <Input
            id="twitter-api-key"
            placeholder="Enter your Twitter API Key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError("");
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter-api-secret">Twitter API Secret</Label>
          <Input
            id="twitter-api-secret"
            type="password"
            placeholder="Enter your Twitter API Secret"
            value={apiSecret}
            onChange={(e) => {
              setApiSecret(e.target.value);
              setError("");
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter-access-token">Access Token</Label>
          <Input
            id="twitter-access-token"
            placeholder="Enter your Twitter Access Token"
            value={accessToken}
            onChange={(e) => {
              setAccessToken(e.target.value);
              setError("");
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter-access-secret">Access Token Secret</Label>
          <Input
            id="twitter-access-secret"
            type="password"
            placeholder="Enter your Twitter Access Token Secret"
            value={accessSecret}
            onChange={(e) => {
              setAccessSecret(e.target.value);
              setError("");
            }}
          />
          <p className="text-xs text-muted-foreground">
            Your Twitter API credentials are stored locally and never sent to our servers.
          </p>
        </div>
        
        <Button type="submit" className="w-full">
          Save Twitter API Credentials
        </Button>
      </form>
    </div>
  );
};

export default TwitterCredentialsForm;
