import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Bell, Moon, Sun, UserCircle } from "lucide-react";

const Settings = () => {
  const [name, setName] = useState("Mock User");
  const [email, setEmail] = useState("user@example.com");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weekly: true,
    marketing: false,
  });
  const [appearance, setAppearance] = useState("light");

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Settings saved successfully!");
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-blue-600"
        >
          Settings
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-600"
        >
          Manage your account settings and preferences
        </motion.p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full mb-6 bg-blue-50">
          <TabsTrigger value="account" className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-600">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-600">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-600">
            <Sun className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Profile Information</CardTitle>
              <CardDescription className="text-slate-600">
                Update your profile information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-600">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-blue-100 text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-blue-100 text-slate-800"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Notification Settings</CardTitle>
              <CardDescription className="text-slate-600">
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-800">Email Notifications</Label>
                    <p className="text-xs text-slate-600">Receive email notifications for important updates</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-800">Push Notifications</Label>
                    <p className="text-xs text-slate-600">Receive push notifications on your devices</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-800">SMS Notifications</Label>
                    <p className="text-xs text-slate-600">Receive text messages for critical alerts</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-800">Weekly Digest</Label>
                    <p className="text-xs text-slate-600">Get a weekly summary of your account activity</p>
                  </div>
                  <Switch
                    checked={notifications.weekly}
                    onCheckedChange={(checked) => setNotifications({...notifications, weekly: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-800">Marketing Emails</Label>
                    <p className="text-xs text-slate-600">Receive promotional emails and newsletters</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Appearance Settings</CardTitle>
              <CardDescription className="text-slate-600">
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-blue-600 mb-2 block">Theme</Label>
                  <div className="flex gap-4">
                    <div
                      onClick={() => setAppearance("light")}
                      className={`flex flex-col items-center gap-2 p-4 border border-blue-100 rounded-md cursor-pointer transition-all ${
                        appearance === "light" ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div className="h-20 w-32 bg-white border border-blue-100 rounded-md relative overflow-hidden">
                        <div className="h-4 bg-blue-500 w-full"></div>
                        <div className="absolute left-2 top-6 w-8 h-2 bg-blue-200 rounded-full"></div>
                        <div className="absolute left-2 top-10 w-12 h-2 bg-blue-200 rounded-full"></div>
                        <div className="absolute left-2 top-14 w-6 h-2 bg-blue-200 rounded-full"></div>
                      </div>
                      <Label className="text-slate-800 flex items-center gap-2">
                        <Sun className="h-4 w-4 text-blue-500" />
                        Light
                      </Label>
                    </div>
                    
                    <div
                      onClick={() => setAppearance("dark")}
                      className={`flex flex-col items-center gap-2 p-4 border border-blue-100 rounded-md cursor-pointer transition-all ${
                        appearance === "dark" ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div className="h-20 w-32 bg-slate-800 border border-slate-700 rounded-md relative overflow-hidden">
                        <div className="h-4 bg-blue-600 w-full"></div>
                        <div className="absolute left-2 top-6 w-8 h-2 bg-slate-600 rounded-full"></div>
                        <div className="absolute left-2 top-10 w-12 h-2 bg-slate-600 rounded-full"></div>
                        <div className="absolute left-2 top-14 w-6 h-2 bg-slate-600 rounded-full"></div>
                      </div>
                      <Label className="text-slate-800 flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-500" />
                        Dark
                      </Label>
                    </div>
                    
                    <div
                      onClick={() => setAppearance("system")}
                      className={`flex flex-col items-center gap-2 p-4 border border-blue-100 rounded-md cursor-pointer transition-all ${
                        appearance === "system" ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div className="h-20 w-32 bg-gradient-to-r from-white to-slate-800 border border-blue-100 rounded-md relative overflow-hidden">
                        <div className="h-4 bg-gradient-to-r from-blue-500 to-blue-600 w-full"></div>
                        <div className="absolute left-2 top-6 w-8 h-2 bg-gradient-to-r from-blue-200 to-slate-600 rounded-full"></div>
                        <div className="absolute left-2 top-10 w-12 h-2 bg-gradient-to-r from-blue-200 to-slate-600 rounded-full"></div>
                        <div className="absolute left-2 top-14 w-6 h-2 bg-gradient-to-r from-blue-200 to-slate-600 rounded-full"></div>
                      </div>
                      <Label className="text-slate-800 flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-blue-500" />
                        System
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Settings;
