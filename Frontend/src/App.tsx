import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import Tags from "./pages/Tags";
import { Login } from "./pages/Login";
import { QuestionDetail } from "./pages/QuestionDetail";
import NotFound from "./pages/NotFound";
import { User } from "./components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useStacks } from "@/hooks/useApi";
import { apiClient } from "@/lib/api";

const queryClient = new QueryClient();

// Initial user state
const initialUser: User = { username: "", role: "guest" };

const App = () => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return initialUser;
  });
  
  const { toast } = useToast();
  const { stacks, loading, createStack, voteOnStack, deleteStack, fetchStacks } = useStacks();

  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser.username && currentUser.role !== 'guest') {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [currentUser]);

  const handleUpdateQuestion = (id: string, updates: any) => {
    console.log('Question updated:', id, updates);
  };

  const handleAddComment = (questionId: string, comment: any) => {
    console.log('Adding comment to question:', questionId, comment);
  };

  // Fix: Update handleAddQuestion to properly handle the form data
  const handleAddQuestion = async (questionData: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    try {
      console.log('Adding question:', questionData);
      
      // Check if user is logged in
      if (currentUser.role === 'guest' || !currentUser.username) {
        toast({
          title: "Login Required",
          description: "You need to login to post questions.",
          variant: "destructive",
        });
        return;
      }

      // Validate the data before sending
      if (!questionData.title || !questionData.description || !questionData.tags || questionData.tags.length === 0) {
        toast({
          title: "Invalid Data",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Call the createStack hook function instead of direct API call
      const response = await createStack({
        title: questionData.title,
        description: questionData.description,
        tags: questionData.tags
      });

      console.log('Question posted successfully:', response);
      
      // Refresh the stacks list to get the latest data
      await fetchStacks();
      
      toast({
        title: "Question Posted Successfully!",
        description: "Your question has been posted and is now visible to the community.",
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Error adding question:', error);
      
      toast({
        title: "Failed to Post Question",
        description: error.message || "Something went wrong while posting your question. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Handle voting for questions
  const handleVote = async (questionId: string, voteType: 'up' | 'down') => {
    if (currentUser.role === 'guest') {
      toast({
        title: "Login Required",
        description: "You need to login to vote on questions.",
        variant: "destructive",
      });
      return;
    }

    try {
      await voteOnStack(questionId, voteType);
      toast({
        title: "Vote Recorded",
        description: `Your ${voteType}vote has been recorded.`,
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: "Voting Failed",
        description: error.message || "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (currentUser.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete questions.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteStack(questionId);
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted.",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete the question. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced login handler with proper token management
  const handleLogin = (user: User, token?: string) => {
    setCurrentUser(user);
    
    // Save token if provided (from actual API login)
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Save user data
    if (user.role !== 'guest') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  // Enhanced logout handler
  const handleLogout = () => {
    setCurrentUser(initialUser);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 2000,
    });
  };

  // Fix: Convert API data to frontend format using the correct MongoDB _id
  const questions = Array.isArray(stacks) ? stacks.map(stack => ({
    id: stack._id, // Use the actual MongoDB _id from backend
    title: stack.title,
    content: stack.description,
    tags: stack.tags,
    author: {
      name: stack.creator?.username || 'Anonymous',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stack.creator?.username}`,
      reputation: 1000
    },
    votes: stack.voteScore || 0,
    answers: stack.comments?.length || 0,
    views: stack.views || 0,
    createdAt: new Date(stack.createdAt).toLocaleDateString(),
    isAccepted: !!stack.solution,
    userVote: null as 'up' | 'down' | null,
    isPinned: stack.isPinned || false,
    isLocked: stack.isLocked || false
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Index 
                  currentUser={currentUser} 
                  onLogin={handleLogin}
                  questions={questions}
                  onAddQuestion={handleAddQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              } 
            />
            <Route 
              path="/questions" 
              element={
                <Questions 
                  currentUser={currentUser} 
                  onLogin={handleLogin}
                  questions={questions}
                  onAddQuestion={handleAddQuestion}
                  onVote={handleVote}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              } 
            />
            <Route 
              path="/tags" 
              element={
                <Tags 
                  currentUser={currentUser} 
                  onLogin={handleLogin}
                  questions={questions}
                  onAddQuestion={handleAddQuestion}
                />
              } 
            />
            <Route 
              path="/question/:id" 
              element={
                <QuestionDetail 
                  currentUser={currentUser} 
                  onLogin={handleLogin}
                />
              } 
            />
            <Route 
              path="/login" 
              element={<Login onLogin={handleLogin} />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
