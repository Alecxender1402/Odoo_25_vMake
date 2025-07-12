import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "./Header";

interface LoginMenuProps {
  currentUser: UserType;
  onLogin: (user: UserType, token?: string) => void;
}

export function LoginMenu({ currentUser, onLogin }: LoginMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleGuestLogin = () => {
    onLogin({ username: "Guest", role: "guest" });
    setOpen(false);
    toast({
      title: "Guest Mode",
      description: "You're now browsing as a guest. Some features are limited.",
      duration: 3000,
    });
  };

  const handleUserLogin = () => {
    navigate('/login');
    setOpen(false);
  };

  const handleAdminLogin = () => {
    // Navigate to login page for admin authentication
    navigate('/login?mode=admin');
    setOpen(false);
  };

  const handleLogout = () => {
    // Clear all user data and tokens
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset to guest state
    onLogin({ username: "", role: "guest" });
    setOpen(false);
    
    toast({
      title: "Logged Out",
      description: currentUser.username === "Guest" 
        ? "You've exited guest mode." 
        : "You have been successfully logged out.",
      duration: 2000,
    });
    
    // Redirect to home page
    navigate('/');
  };

  // If user has actively chosen a login mode (username is not empty), show logout option
  if (currentUser.username !== "" && currentUser.role !== "guest") {
    return (
      <div className="relative" ref={ref}>
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          <User className="h-5 w-5" />
          <span className="hidden sm:ml-2 sm:inline">
            {currentUser.username} ({currentUser.role})
          </span>
        </Button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
            <div className="px-4 py-2 text-sm text-muted-foreground border-b">
              Logged in as {currentUser.role}
            </div>
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  // If user is in guest mode (Guest username), show guest logout
  if (currentUser.username === "Guest" && currentUser.role === "guest") {
    return (
      <div className="relative" ref={ref}>
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          <User className="h-5 w-5" />
          <span className="hidden sm:ml-2 sm:inline">Guest Mode</span>
        </Button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
            <div className="px-4 py-2 text-sm text-muted-foreground border-b">
              Browsing as Guest
            </div>
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Guest Mode
            </button>
          </div>
        )}
      </div>
    );
  }

  // If user is not logged in at all, show login options
  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
        <User className="h-5 w-5" />
        <span className="hidden sm:ml-2 sm:inline">Login</span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
          <div className="px-4 py-2 text-sm text-muted-foreground border-b">
            Choose login type
          </div>
          <button
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center transition-colors"
            onClick={handleGuestLogin}
          >
            <User className="h-4 w-4 mr-2" />
            Continue as Guest
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center transition-colors"
            onClick={handleUserLogin}
          >
            <User className="h-4 w-4 mr-2" />
            User Login
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center transition-colors"
            onClick={handleAdminLogin}
          >
            <User className="h-4 w-4 mr-2" />
            Admin (Demo)
          </button>
        </div>
      )}
    </div>
  );
}
