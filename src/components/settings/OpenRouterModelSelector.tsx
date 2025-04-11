
import { useEffect, useState } from "react";
import { fetchOpenRouterModels, OpenRouterModel, saveSelectedOpenRouterModels, getSelectedOpenRouterModels, getSavedOpenRouterModels } from "@/services/openrouter";
import { Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface OpenRouterModelSelectorProps {
  apiKey: string;
}

const OpenRouterModelSelector = ({ apiKey }: OpenRouterModelSelectorProps) => {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load previously selected models
    const savedSelected = getSelectedOpenRouterModels();
    setSelectedModels(savedSelected);
    
    // Load cached models
    const savedModels = getSavedOpenRouterModels();
    if (savedModels.length > 0) {
      setModels(savedModels);
    }
  }, []);

  const loadModels = async () => {
    if (!apiKey) {
      setError("API key is required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedModels = await fetchOpenRouterModels();
      setModels(fetchedModels);
      
      // Update selected models based on IDs (to maintain selection after refresh)
      if (selectedModels.length > 0) {
        const selectedIds = selectedModels.map(sm => sm.id);
        const updatedSelected = fetchedModels.filter(m => selectedIds.includes(m.id));
        setSelectedModels(updatedSelected);
        saveSelectedOpenRouterModels(updatedSelected);
      }
    } catch (err) {
      setError("Failed to load models");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModelSelection = (model: OpenRouterModel) => {
    setSelectedModels(prev => {
      // Check if model is already selected
      const isSelected = prev.some(m => m.id === model.id);
      
      if (isSelected) {
        // Remove model from selection
        return prev.filter(m => m.id !== model.id);
      } else {
        // Add model to selection (limit to 5)
        if (prev.length >= 5) {
          toast.warning("Maximum 5 models can be selected as fallbacks");
          return prev;
        }
        return [...prev, model];
      }
    });
  };

  const handleSaveSelection = () => {
    saveSelectedOpenRouterModels(selectedModels);
  };

  useEffect(() => {
    // Load models when API key changes
    if (apiKey) {
      loadModels();
    }
  }, [apiKey]);

  // Helper function to safely format pricing values
  const formatPrice = (price: any): string => {
    if (typeof price === 'number') {
      return price.toFixed(6);
    } else if (typeof price === 'string') {
      // Try to convert string to number
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? '0.000000' : numPrice.toFixed(6);
    } else {
      // Return default value if price is undefined or another type
      return '0.000000';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">OpenRouter Models</h3>
        <Button 
          onClick={loadModels} 
          size="sm" 
          disabled={!apiKey || loading}
          variant="outline"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Refresh Models
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {selectedModels.length > 0 && (
        <Card className="bg-muted/50">
          <CardHeader className="p-4">
            <CardTitle className="text-md">Selected Fallback Models ({selectedModels.length}/5)</CardTitle>
            <CardDescription>
              Models will be used in this priority order for content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {selectedModels.map((model, index) => (
                <div key={model.id} className="flex items-center justify-between p-2 bg-card rounded-md border">
                  <div className="flex items-center">
                    <Badge variant={index === 0 ? "default" : "outline"} className="mr-2">
                      {index === 0 ? "Primary" : `Fallback ${index}`}
                    </Badge>
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.provider}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => toggleModelSelection(model)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button className="w-full mt-2" onClick={handleSaveSelection}>
                Save Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-2">
        {models.map((model) => {
          const isSelected = selectedModels.some(m => m.id === model.id);
          const selectionIndex = selectedModels.findIndex(m => m.id === model.id);
          
          return (
            <Card key={model.id} className={`border transition-colors ${isSelected ? 'border-primary' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleModelSelection(model)}
                    id={`model-${model.id}`}
                  />
                  <div>
                    <label 
                      htmlFor={`model-${model.id}`}
                      className="font-medium cursor-pointer flex items-center"
                    >
                      {model.name}
                      {isSelected && (
                        <Badge variant="outline" className="ml-2">
                          {selectionIndex === 0 ? "Primary" : `Fallback ${selectionIndex}`}
                        </Badge>
                      )}
                    </label>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="mr-2">{model.provider}</span>
                      <span>Context: {Math.round(model.context_length / 1000)}k tokens</span>
                    </div>
                    <p className="text-xs mt-1">{model.description?.substring(0, 100)}{model.description?.length > 100 ? '...' : ''}</p>
                  </div>
                </div>
                <div className="text-xs text-right">
                  <div className="font-medium">Pricing</div>
                  <div>Input: ${formatPrice(model.pricing?.prompt)}/1K tokens</div>
                  <div>Output: ${formatPrice(model.pricing?.completion)}/1K tokens</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {models.length === 0 && !loading && apiKey && (
          <Alert>
            <AlertDescription>
              No models found. Click "Refresh Models" to load available models.
            </AlertDescription>
          </Alert>
        )}
        
        {loading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading models...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenRouterModelSelector;
