import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Twitter, BarChart2, Calendar, Settings, History, Edit, Link2 } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart2,
    },
    {
      name: "Post",
      href: "/post",
      icon: Edit,
    },
    {
      name: "History",
      href: "/history",
      icon: History,
    },
    {
      name: "Analysis",
      href: "/analysis",
      icon: Twitter,
    },
    {
      name: "Social Credentials",
      href: "/social-credentials",
      icon: Link2,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Twitter className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-semibold text-black">Tweet Tribune</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-black hover:bg-slate-100"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
