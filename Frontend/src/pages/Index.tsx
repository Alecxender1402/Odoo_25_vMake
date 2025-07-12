import React, { useState } from "react";
import { Header, User, UserRole } from "@/components/layout/Header";
import { QuestionList } from "@/components/questions/QuestionList";
import { FilterSidebar } from "@/components/sidebar/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Users, MessageSquare, CheckCircle } from "lucide-react";
import AskQuestionModal from "@/components/layout/AskQuestionModal";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";

interface IndexProps {
  currentUser: User;
  onLogin: (user: User) => void;
  questions: any[];
  onAddQuestion: (question: any) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

const Index = ({ currentUser, onLogin, questions: initialQuestionsFromProps, onAddQuestion, onDeleteQuestion }: IndexProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [questions, setQuestions] = useState(initialQuestionsFromProps);

  // 4. Modal handlers
  const handleAskQuestion = () => setIsAskModalOpen(true);
  const handleCloseAskModal = () => setIsAskModalOpen(false);

  // 5. Handle new question submission
  const handleQuestionSubmit = (question: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    const newQuestion = {
      id: (questions.length + 1).toString(),
      title: question.title,
      content: question.description, // Map description to content
      tags: question.tags,
      author: { 
        name: currentUser.username || "Anonymous",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
        reputation: currentUser.role === 'admin' ? 2000 : 100
      },
      votes: 0,
      answers: 0,
      createdAt: "Just now",
      isAccepted: false,
      userVote: null as 'up' | 'down' | null
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    onAddQuestion(newQuestion);
    
    // Show success toast
    toast({
      title: "Question Posted Successfully!",
      description: "Your question has been posted and is now visible to the community.",
      duration: 5000,
    });
    
    handleCloseAskModal();
  };

  // 6. Handle voting for questions
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

  // 7. Handle question deletion (admin only)
  const handleDeleteQuestion = (questionId: string) => {
    if (currentUser.role === 'admin') {
      setQuestions((prev) => prev.filter(q => q.id !== questionId));
      if (onDeleteQuestion) {
        onDeleteQuestion(questionId);
      }
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted.",
        duration: 3000,
      });
    }
  };

  // Demo function to trigger notifications (for testing)
  const triggerDemoNotification = () => {
    if (currentUser.role === 'guest') return;
    
    const notificationTypes = ['answer', 'comment', 'mention'] as const;
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const demoNotifications = {
      answer: {
        title: 'New Answer',
        message: `Demo User answered your question about ${questions[0]?.title || 'React Context'}`,
        relatedQuestionId: questions[0]?.id || '1'
      },
      comment: {
        title: 'New Comment',
        message: 'Demo User commented on your answer with helpful insights',
        relatedQuestionId: questions[1]?.id || '2'
      },
      mention: {
        title: 'Mentioned You',
        message: `Demo User mentioned you: "@${currentUser.username} this might help you!"`,
        relatedQuestionId: questions[2]?.id || '3'
      }
    };

    addNotification({
      type: randomType,
      ...demoNotifications[randomType],
      read: false,
      createdAt: 'Just now',
      fromUser: {
        name: 'Demo User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
      }
    });

    toast({
      title: "Demo Notification Added!",
      description: `A ${randomType} notification has been added to test the system.`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Pass all required props to Header */}
      <Header
        currentUser={currentUser}
        onLogin={onLogin}
        onAskQuestion={handleAskQuestion}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="container py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                StackIt
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              A minimal Q&A platform for collaborative learning and structured knowledge sharing.
              Ask questions, share answers, and build your expertise together.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="shadow-lg" 
                onClick={handleAskQuestion}
                disabled={currentUser.role === "guest"}
              >
                <Plus className="h-5 w-5 mr-2" />
                {currentUser.role === "guest" ? "Login to Ask Questions" : "Ask Your First Question"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/questions')}>
                Browse Questions
              </Button>
              {currentUser.role !== "guest" && (
                <Button variant="secondary" size="lg" onClick={triggerDemoNotification}>
                  🔔 Test Notification
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Questions</h2>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{questions.length} questions</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>28,391 answers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>4,256 users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Questions */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">Latest Questions</h2>
                <Badge variant="secondary">{questions.length} questions</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/questions')}>
                View All
              </Button>
            </div>
            {/* Pass questions as prop if your QuestionList expects it */}
            <QuestionList 
              questions={questions} 
              currentUser={currentUser}
              onVote={handleVote} 
              onDelete={handleDeleteQuestion}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onRequestClose={handleCloseAskModal}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
};

export default Index;
