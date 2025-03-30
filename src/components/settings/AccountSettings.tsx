
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin } from "lucide-react";
import ApiKeyForm from "./ApiKeyForm";

const AccountSettings = () => {
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
          <div className="flex flex-col space-y-2">
            <Button className="justify-start" variant="outline">
              <Twitter className="mr-2 h-5 w-5 text-twitter" />
              Connect Twitter Account
            </Button>
            <Button className="justify-start" variant="outline">
              <Linkedin className="mr-2 h-5 w-5 text-linkedin" />
              Connect LinkedIn Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for OpenAI integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyForm onApiKeySubmit={(key) => console.log("API key saved")} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
