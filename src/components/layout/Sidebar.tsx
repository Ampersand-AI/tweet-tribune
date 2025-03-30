
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  BarChart,
  Settings,
  Calendar,
  Twitter,
  Linkedin,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const links = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "Analytics", icon: BarChart, path: "/analytics" },
    { name: "Schedule", icon: Calendar, path: "/schedule" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-border transition-all duration-300 h-screen",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-6">
        {expanded && <h1 className="text-xl font-bold">Tweet Tribune</h1>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className="flex flex-col flex-1 py-6">
        <div className="space-y-1 px-3">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent group"
            >
              <link.icon className="h-5 w-5 mr-3" />
              {expanded && <span>{link.name}</span>}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            {expanded && "CONNECTED ACCOUNTS"}
          </div>
          <div className="space-y-1 px-3 mt-1">
            <Button variant="outline" className="w-full justify-start">
              <Twitter className="h-5 w-5 text-twitter mr-3" />
              {expanded && <span>Connect Twitter</span>}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Linkedin className="h-5 w-5 text-linkedin mr-3" />
              {expanded && <span>Connect LinkedIn</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
