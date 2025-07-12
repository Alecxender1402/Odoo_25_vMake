import { Search, Bell, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginMenu } from "./LoginMenu";
import { Link, useLocation } from "react-router-dom";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"; 

export type UserRole = "guest" | "user" | "admin";

export interface User {
  username: string;
  role: UserRole;
}

interface HeaderProps {
  currentUser: User;
  onLogin: (user: User) => void;
  onAskQuestion: () => void; 
}

export const Header = ({ currentUser, onLogin, onAskQuestion }: HeaderProps) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent cursor-pointer">
              StackIt
            </h1>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/questions">
              <Button 
                variant="ghost" 
                className={`text-sm font-medium ${location.pathname === '/questions' ? 'bg-muted text-primary' : ''}`}
              >
                Questions
              </Button>
            </Link>
            <Link to="/tags">
              <Button 
                variant="ghost" 
                className={`text-sm font-medium ${location.pathname === '/tags' ? 'bg-muted text-primary' : ''}`}
              >
                Tags
              </Button>
            </Link>
          </nav>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-10 bg-background border-muted-foreground/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            size="sm"
            className="hidden sm:flex"
            onClick={onAskQuestion}
            disabled={currentUser.role === "guest"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
          
          {/* Notifications */}
          {currentUser.role !== "guest" && <NotificationDropdown />}
          
          {/* User Menu */}
          <LoginMenu currentUser={currentUser} onLogin={onLogin} />
        </div>
      </div>
    </header>
  );
};
