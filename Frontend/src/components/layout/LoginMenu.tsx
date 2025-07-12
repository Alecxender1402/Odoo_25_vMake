import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "./Header";

interface LoginMenuProps {
  currentUser: UserType;
  onLogin: (user: UserType) => void;
}

export function LoginMenu({ currentUser, onLogin }: LoginMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleGuestLogin = () => {
    onLogin({ username: "Guest", role: "guest" });
    setOpen(false);
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
    onLogin({ username: "", role: "guest" });
    setOpen(false);
  };

  // If user has actively chosen a login mode (username is not empty), show logout option
  if (currentUser.username !== "") {
    return (
      <div className="relative" ref={ref}>
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          <User className="h-5 w-5" />
          <span className="hidden sm:ml-2 sm:inline">
            {currentUser.username === "Guest" ? "Guest Mode" : `${currentUser.username} (${currentUser.role})`}
          </span>
        </Button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
            <div className="px-4 py-2 text-sm text-muted-foreground border-b">
              {currentUser.username === "Guest" ? "Browsing as Guest" : `Logged in as ${currentUser.role}`}
            </div>
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {currentUser.username === "Guest" ? "Exit Guest Mode" : "Logout"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // If user is guest, show login options
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
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
            onClick={handleGuestLogin}
          >
            <User className="h-4 w-4 mr-2" />
            Continue as Guest
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
            onClick={handleUserLogin}
          >
            <User className="h-4 w-4 mr-2" />
            User Login
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
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
