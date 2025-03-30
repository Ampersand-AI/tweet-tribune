
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyForm = ({ onApiKeySubmit }: ApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    // Basic validation for OpenAI API key format
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      setError("Please enter a valid OpenAI API key");
      return;
    }

    onApiKeySubmit(apiKey);
    setError("");
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
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <Input
            id="api-key"
            placeholder="sk-..."
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
        
        <Button type="submit" className="w-full">
          Save API Key
        </Button>
      </form>
    </div>
  );
};

export default ApiKeyForm;
