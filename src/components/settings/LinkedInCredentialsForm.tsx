
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface LinkedInCredentialsFormProps {
  onSubmit: (clientId: string, clientSecret: string) => void;
}

const LinkedInCredentialsForm = ({ onSubmit }: LinkedInCredentialsFormProps) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedClientId = localStorage.getItem("linkedin-client-id");
    const savedClientSecret = localStorage.getItem("linkedin-client-secret");
    
    if (savedClientId) {
      setClientId(savedClientId);
    }
    
    if (savedClientSecret) {
      setClientSecret(savedClientSecret);
    }
    
    if (savedClientId && savedClientSecret) {
      setIsSubmitted(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId.trim()) {
      setError("Client ID is required");
      return;
    }
    
    if (!clientSecret.trim()) {
      setError("Client Secret is required");
      return;
    }

    // Save credentials to localStorage
    localStorage.setItem("linkedin-client-id", clientId);
    localStorage.setItem("linkedin-client-secret", clientSecret);
    
    onSubmit(clientId, clientSecret);
    setError("");
    setIsSubmitted(true);
    
    toast.success("LinkedIn Credentials Saved", {
      description: "Your LinkedIn credentials have been saved successfully."
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
            Your LinkedIn credentials have been saved and are ready to use.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin-client-id">LinkedIn Client ID</Label>
          <Input
            id="linkedin-client-id"
            placeholder="Enter your LinkedIn Client ID"
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setError("");
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedin-client-secret">LinkedIn Client Secret</Label>
          <Input
            id="linkedin-client-secret"
            type="password"
            placeholder="Enter your LinkedIn Client Secret"
            value={clientSecret}
            onChange={(e) => {
              setClientSecret(e.target.value);
              setError("");
            }}
          />
          <p className="text-xs text-muted-foreground">
            Your LinkedIn credentials are stored locally and never sent to our servers.
          </p>
        </div>
        
        <Button type="submit" className="w-full">
          Save LinkedIn Credentials
        </Button>
      </form>
    </div>
  );
};

export default LinkedInCredentialsForm;
