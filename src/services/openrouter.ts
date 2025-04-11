
import { toast } from "sonner";

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  provider: string;
}

export interface OpenRouterModelResponse {
  data: OpenRouterModel[];
}

export const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  try {
    const apiKey = localStorage.getItem("openrouter-api-key");
    
    if (!apiKey) {
      toast.error("OpenRouter API key is missing");
      return [];
    }
    
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("Error fetching OpenRouter models:", errorData);
      toast.error("Failed to fetch OpenRouter models");
      return [];
    }
    
    const data: OpenRouterModelResponse = await response.json();
    toast.success(`Loaded ${data.data.length} models from OpenRouter`);
    
    // Sort models by performance/pricing (lower cost = better rank)
    const sortedModels = data.data.sort((a, b) => 
      (a.pricing.completion + a.pricing.prompt) - (b.pricing.completion + b.pricing.prompt)
    );
    
    // Save models to localStorage
    localStorage.setItem("openrouter-models", JSON.stringify(sortedModels));
    
    return sortedModels;
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    toast.error("Failed to connect to OpenRouter API");
    return [];
  }
};

export const getSavedOpenRouterModels = (): OpenRouterModel[] => {
  const modelsString = localStorage.getItem("openrouter-models");
  return modelsString ? JSON.parse(modelsString) : [];
};

export const getSelectedOpenRouterModels = (): OpenRouterModel[] => {
  const selectedModelsString = localStorage.getItem("openrouter-selected-models");
  return selectedModelsString ? JSON.parse(selectedModelsString) : [];
};

export const saveSelectedOpenRouterModels = (selectedModels: OpenRouterModel[]): void => {
  // Limit to maximum 5 models
  const limitedModels = selectedModels.slice(0, 5);
  localStorage.setItem("openrouter-selected-models", JSON.stringify(limitedModels));
  toast.success(`Saved ${limitedModels.length} models as fallbacks`);
};

export const generateContentWithOpenRouter = async (
  prompt: string, 
  systemPrompt: string = "You are a helpful assistant."
): Promise<string> => {
  try {
    const apiKey = localStorage.getItem("openrouter-api-key");
    
    if (!apiKey) {
      toast.error("OpenRouter API key is required");
      return "";
    }
    
    const selectedModels = getSelectedOpenRouterModels();
    
    if (selectedModels.length === 0) {
      toast.error("No OpenRouter models selected");
      return "";
    }
    
    // Use the first model as default, others as fallbacks
    const modelId = selectedModels[0].id;
    
    // Fallback model IDs (up to 4 additional models)
    const fallbacks = selectedModels.slice(1, 5).map(model => model.id);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Social Media Post Generator"
      },
      body: JSON.stringify({
        model: modelId,
        fallbacks: fallbacks.length > 0 ? fallbacks : undefined,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.error("OpenRouter API error:", errorData);
      toast.error(`API Error: ${errorData.error?.message || "Failed to generate content"}`);
      return "";
    }
    
    const data = await response.json();
    console.log("OpenRouter API response:", data);
    
    // Extract content from OpenRouter response
    const content = data.choices?.[0]?.message?.content || "";
    
    if (!content) {
      toast.error("Empty response from OpenRouter API");
      return "";
    }
    
    return content;
  } catch (error: any) {
    console.error("Error generating content with OpenRouter:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate content");
    return "";
  }
};
