import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Search, Plus, MessageSquare, Users, Home, Tags, User as UserIcon, LogOut, Settings } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "admin" | "user" | "guest";

export interface User {
  username: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  reputation?: number;
}

interface HeaderProps {
  currentUser: User;
  onLogin: (user: User, token?: string) => void;
  onAskQuestion?: () => void;
}

export const Header = ({ currentUser, onLogin, onAskQuestion }: HeaderProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [showDemoLogin, setShowDemoLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const demoUsers = [
    { username: "admin", email: "admin@stackit.com", password: "admin123", role: "admin" as UserRole },
    { username: "john_doe", email: "john@example.com", password: "password123", role: "user" as UserRole },
    { username: "jane_smith", email: "jane@example.com", password: "password123", role: "user" as UserRole },
    { username: "tech_guru", email: "techguru@example.com", password: "password123", role: "user" as UserRole },
  ];

  const handleDemoLogin = async (demoUser: any) => {
    try {
      setIsLoggingIn(true);
      
      // Make actual API call to login
      const response = await apiClient.login({
        email: demoUser.email,
        password: demoUser.password
      });
      
      console.log('Login response:', response);
      
      // Store the real token
      localStorage.setItem('token', response.token);
      
      onLogin({
        username: response.user.username,
        role: response.user.role,
        email: response.user.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.username}`,
        reputation: response.user.reputation || 0
      }, response.token);
      
      setShowDemoLogin(false);
      
      toast({
        title: "Logged In Successfully",
        description: `Welcome back, ${response.user.username}!`,
        duration: 3000,
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    onLogin({ username: "", role: "guest" });
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 2000,
    });
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Questions', href: '/questions', icon: MessageSquare },
    { name: 'Tags', href: '/tags', icon: Tags },
    { name: 'Users', href: '/users', icon: Users },
  ];

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">StackIt</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-4">
            {/* Ask Question Button */}
            {onAskQuestion && currentUser.role !== "guest" && (
              <Button 
                onClick={onAskQuestion} 
                size="sm"
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            )}

            {/* User Actions */}
            {currentUser.role === "guest" ? (
              <div className="flex items-center space-x-2">
                <DropdownMenu open={showDemoLogin} onOpenChange={setShowDemoLogin}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" disabled={isLoggingIn}>
                      {isLoggingIn ? "Logging in..." : "Login (Demo)"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">Demo Users</div>
                    {demoUsers.map((user) => (
                      <DropdownMenuItem
                        key={user.username}
                        onClick={() => handleDemoLogin(user)}
                        className="flex items-center space-x-2 cursor-pointer"
                        disabled={isLoggingIn}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.role} • {user.email}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationDropdown />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} />
                        <AvatarFallback>{currentUser.username[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium">{currentUser.username}</div>
                        <div className="flex items-center space-x-1">
                          <Badge variant={currentUser.role === "admin" ? "destructive" : "secondary"} className="text-xs">
                            {currentUser.role}
                          </Badge>
                          {currentUser.reputation && (
                            <span className="text-xs text-muted-foreground">
                              {currentUser.reputation} rep
                            </span>
                          )}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
