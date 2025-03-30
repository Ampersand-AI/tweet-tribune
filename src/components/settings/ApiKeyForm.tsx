
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check } from "lucide-react";
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load saved key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem(`${keyType}-api-key`);
    if (savedKey) {
      setApiKey(savedKey);
      setIsSubmitted(true);
    }
  }, [keyType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError(`${label} is required`);
      return;
    }

    // Save key to localStorage
    localStorage.setItem(`${keyType}-api-key`, apiKey);
    
    onApiKeySubmit(apiKey);
    setError("");
    setIsSubmitted(true);
    
    toast.success(`${label} Saved`, {
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
      
      {isSubmitted && !error && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">API Key Saved</AlertTitle>
          <AlertDescription className="text-green-600">
            Your {label} has been saved and is ready to use.
          </AlertDescription>
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
            onChange={(e) => {
              setApiKey(e.target.value);
              setError("");
            }}
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
