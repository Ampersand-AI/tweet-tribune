
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface ApiKeyFormProps {
  keyType: "openai" | "twitter" | "twitter-secret";
  label: string;
  placeholder: string;
  description?: string;
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyForm = ({ 
  keyType, 
  label, 
  placeholder, 
  description, 
  onApiKeySubmit 
}: ApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  // Load saved key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem(`${keyType}-api-key`);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [keyType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError(`${label} is required`);
      return;
    }

    // Basic validation based on key type
    if (keyType === "openai" && !apiKey.startsWith("sk-")) {
      setError("Please enter a valid Claude API key");
      return;
    }

    // Save key to localStorage
    localStorage.setItem(`${keyType}-api-key`, apiKey);
    
    onApiKeySubmit(apiKey);
    setError("");
    
    toast.success("API Key Saved", {
      description: `Your ${label} has been saved successfully.`
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${keyType}-api-key`}>{label}</Label>
          <Input
            id={`${keyType}-api-key`}
            placeholder={placeholder}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        <Button type="submit" className="w-full">
          Save {label}
        </Button>
      </form>
    </div>
  );
};

export default ApiKeyForm;
