import { useState } from "react";
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

const queryClient = new QueryClient();

// Initial user state
const initialUser: User = { username: "", role: "guest" };

// Initial questions data
const initialQuestions = [
  {
    id: "1",
    title: "How to use React context?",
    content: "<p>I want to share state between components without prop drilling. Can someone explain how to use React Context API effectively?</p><p>I've heard about createContext and useContext but I'm not sure how to implement them properly.</p>",
    tags: ["react", "context"],
    author: { 
      name: "Alice",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      reputation: 850
    },
    votes: 5,
    answers: 2,
    views: 120,
    createdAt: "1 hour ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "2",
    title: "Next.js vs Vite: Which build tool should I choose?",
    content: "<p>I'm starting a new React project and can't decide between Next.js and Vite. What are the main differences and when should I use each?</p><p>I need server-side rendering capabilities but also want fast development experience.</p>",
    tags: ["nextjs", "vite", "react", "build-tools"],
    author: { 
      name: "Bob Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      reputation: 1200
    },
    votes: 18,
    answers: 5,
    views: 234,
    createdAt: "3 hours ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "3",
    title: "Python async/await best practices for web scraping",
    content: "<p>I'm building a web scraper using Python and want to make it more efficient with async/await. What are the best practices?</p><p>Should I use aiohttp or requests with asyncio? How do I handle rate limiting?</p>",
    tags: ["python", "async", "web-scraping", "aiohttp"],
    author: { 
      name: "Carol Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
      reputation: 950
    },
    votes: 12,
    answers: 3,
    views: 178,
    createdAt: "5 hours ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "4",
    title: "Kubernetes deployment strategies: Blue-Green vs Rolling Update",
    content: "<p>I need to deploy my application to production with zero downtime. What's the difference between Blue-Green and Rolling Update deployment strategies?</p><p>Which one is better for a high-traffic e-commerce application?</p>",
    tags: ["kubernetes", "devops", "deployment", "production"],
    author: { 
      name: "Dave Ops",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dave",
      reputation: 1850
    },
    votes: 24,
    answers: 7,
    views: 312,
    createdAt: "8 hours ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "5",
    title: "GraphQL vs REST API: Performance comparison",
    content: "<p>I'm designing an API for my mobile app and wondering whether to use GraphQL or REST. What are the performance implications?</p><p>The app needs to work well on slow mobile networks.</p>",
    tags: ["graphql", "rest", "api", "performance", "mobile"],
    author: { 
      name: "Eve Backend",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
      reputation: 1450
    },
    votes: 31,
    answers: 9,
    views: 445,
    createdAt: "12 hours ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "6",
    title: "Machine Learning model deployment with Docker and AWS",
    content: "<p>I've trained a machine learning model using scikit-learn and want to deploy it to AWS. What's the best approach using Docker?</p><p>Should I use ECS, EKS, or Lambda for hosting?</p>",
    tags: ["machine-learning", "docker", "aws", "deployment", "scikit-learn"],
    author: { 
      name: "Frank ML",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
      reputation: 2100
    },
    votes: 19,
    answers: 4,
    views: 267,
    createdAt: "1 day ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "7",
    title: "Tailwind CSS vs Styled Components: Maintainability perspective",
    content: "<p>Our team is debating between Tailwind CSS and Styled Components for our React project. Which one is more maintainable in the long run?</p><p>We have a team of 8 developers with varying CSS skills.</p>",
    tags: ["tailwind", "styled-components", "css", "react", "maintainability"],
    author: { 
      name: "Grace Frontend",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
      reputation: 1320
    },
    votes: 15,
    answers: 6,
    views: 189,
    createdAt: "1 day ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "8",
    title: "PostgreSQL indexing strategies for large datasets",
    content: "<p>My PostgreSQL database has grown to 50GB and queries are getting slow. What indexing strategies should I implement?</p><p>The main queries involve time-range filters and JOIN operations on user data.</p>",
    tags: ["postgresql", "database", "indexing", "performance", "sql"],
    author: { 
      name: "Henry DBA",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
      reputation: 2450
    },
    votes: 27,
    answers: 8,
    views: 356,
    createdAt: "2 days ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "9",
    title: "Unity 3D physics optimization for mobile games",
    content: "<p>I'm developing a mobile game in Unity and the physics simulation is causing performance issues on older devices. How can I optimize it?</p><p>The game has many dynamic objects that need to interact with each other.</p>",
    tags: ["unity3d", "gamedev", "mobile", "optimization", "physics"],
    author: { 
      name: "Ivy GameDev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy",
      reputation: 890
    },
    votes: 14,
    answers: 3,
    views: 145,
    createdAt: "3 days ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "10",
    title: "Blockchain smart contract security audit checklist",
    content: "<p>I've written my first Ethereum smart contract in Solidity and want to make sure it's secure before deployment. What should I check?</p><p>Are there any automated tools for security analysis?</p>",
    tags: ["blockchain", "ethereum", "solidity", "security", "smart-contracts"],
    author: { 
      name: "Jack Crypto",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
      reputation: 1670
    },
    votes: 22,
    answers: 5,
    views: 289,
    createdAt: "4 days ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "11",
    title: "Flutter vs React Native: 2025 comparison for cross-platform development",
    content: "<p>I need to build a cross-platform mobile app and can't decide between Flutter and React Native. What are the current pros and cons in 2025?</p><p>The app will have complex animations and need to integrate with native device features.</p>",
    tags: ["flutter", "react-native", "mobile", "cross-platform", "2025"],
    author: { 
      name: "Kate Mobile",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kate",
      reputation: 1540
    },
    votes: 33,
    answers: 11,
    views: 487,
    createdAt: "5 days ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  }
];

const App = () => {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [questions, setQuestions] = useState(initialQuestions);
  const { toast } = useToast();

  const handleUpdateQuestion = (id: string, updates: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleAddComment = (questionId: string, comment: any) => {
    // This would be implemented for adding comments to questions
    console.log('Adding comment to question:', questionId, comment);
  };

  const handleAddQuestion = (newQuestion: any) => {
    setQuestions(prev => [newQuestion, ...prev]);
  };

  // Handle voting for questions
  const handleVote = (questionId: string, voteType: 'up' | 'down') => {
    if (currentUser.role === 'guest') {
      toast({
        title: "Login Required",
        description: "You need to login to vote on questions.",
        variant: "destructive",
      });
      return;
    }

    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        if (question.id === questionId) {
          const currentVote = question.userVote;
          let newVotes = question.votes;
          let newUserVote: 'up' | 'down' | null = voteType;

          // Calculate vote changes
          if (currentVote === voteType) {
            // User is removing their vote
            newVotes += voteType === 'up' ? -1 : 1;
            newUserVote = null;
          } else if (currentVote) {
            // User is changing their vote
            newVotes += voteType === 'up' ? 2 : -2;
          } else {
            // User is voting for the first time
            newVotes += voteType === 'up' ? 1 : -1;
          }

          return {
            ...question,
            votes: newVotes,
            userVote: newUserVote,
          };
        }
        return question;
      })
    );

    // Show success toast
    toast({
      title: "Vote Recorded",
      description: `Your ${voteType}vote has been recorded.`,
      duration: 2000,
    });
  };

  // Handle question deletion (admin only)
  const handleDeleteQuestion = (questionId: string) => {
    if (currentUser.role === 'admin') {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted.",
        duration: 3000,
      });
    }
  };

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
                  onLogin={setCurrentUser}
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
                  onLogin={setCurrentUser}
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
                  onLogin={setCurrentUser}
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
                  onLogin={setCurrentUser}
                  questions={questions}
                  onUpdateQuestion={handleUpdateQuestion}
                  onAddComment={handleAddComment}
                />
              } 
            />
            <Route 
              path="/login" 
              element={<Login onLogin={setCurrentUser} />} 
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
