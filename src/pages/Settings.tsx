
import MainLayout from "@/components/layout/MainLayout";
import AccountSettings from "@/components/settings/AccountSettings";
import { useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  // Initialize API keys on first load
  useEffect(() => {
    // Set the Gemini API key if not already set
    if (!localStorage.getItem("gemini-api-key")) {
      localStorage.setItem("gemini-api-key", "AIzaSyCTRdzlULGXlmC7qXlt-aimyNVFFkl1rw4");
      console.log("Gemini API key initialized");
    }
    
    // Set the DeepSeek API key if not already set
    if (!localStorage.getItem("deepseek-api-key")) {
      localStorage.setItem("deepseek-api-key", "sk-a53303b3873b42be8910c5fd16e0ad4a");
      console.log("DeepSeek API key initialized");
    }
    
    // Show a notification that keys are initialized
    toast.success("API keys initialized", {
      description: "Gemini and DeepSeek API keys have been set up automatically"
    });
  }, []);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <AccountSettings />
      </div>
    </MainLayout>
  );
};

export default Settings;
