import React, { useState, useMemo, useEffect } from "react";
import { Header, User } from "@/components/layout/Header";
import { QuestionList } from "@/components/questions/QuestionList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, TrendingUp, Clock, Award } from "lucide-react";
import AskQuestionModal from "@/components/layout/AskQuestionModal";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

interface QuestionsProps {
  currentUser: User;
  onLogin: (user: User) => void;
  questions: any[];
  onAddQuestion: (question: any) => void;
  onVote: (questionId: string, voteType: 'up' | 'down') => void;
}

const Questions = ({ currentUser, onLogin, questions, onAddQuestion, onVote }: QuestionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Initialize tag from URL params
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  // Get all unique tags from questions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach(question => {
      question.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [questions]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter(question =>
        question.tags?.includes(selectedTag)
      );
    }

    // Sort questions
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "votes":
        return filtered.sort((a, b) => b.votes - a.votes);
      case "answers":
        return filtered.sort((a, b) => b.answers - a.answers);
      default:
        return filtered;
    }
  }, [questions, searchTerm, selectedTag, sortBy]);

  // Modal handlers
  const handleAskQuestion = () => setIsAskModalOpen(true);
  const handleCloseAskModal = () => setIsAskModalOpen(false);

  // Handle new question submission
  const handleQuestionSubmit = (question: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    const newQuestion = {
      id: (questions.length + 1).toString(),
      title: question.title,
      content: question.description,
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

    onAddQuestion(newQuestion);
    
    toast({
      title: "Question Posted Successfully!",
      description: "Your question has been posted and is now visible to the community.",
      duration: 5000,
    });
    
    handleCloseAskModal();
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    // Update URL with selected tag
    setSearchParams({ tag });
  };

  const handleTagClickFromCard = (tag: string) => {
    setSelectedTag(tag);
    setSearchParams({ tag });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        onLogin={onLogin}
        onAskQuestion={handleAskQuestion}
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Questions</h1>
              <p className="text-muted-foreground">
                Explore all questions from the community
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={handleAskQuestion}
              disabled={currentUser.role === "guest"}
            >
              <Plus className="h-5 w-5 mr-2" />
              {currentUser.role === "guest" ? "Login to Ask" : "Ask Question"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Tag Filter */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Oldest
                    </div>
                  </SelectItem>
                  <SelectItem value="votes">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Voted
                    </div>
                  </SelectItem>
                  <SelectItem value="answers">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Most Answers
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{filteredQuestions.length} questions</span>
              {selectedTag !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTag("all")}>
                  {selectedTag} ✕
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      {selectedTag === "all" && (
        <div className="border-b bg-muted/20">
          <div className="container py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Popular Tags</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/tags')}
                className="text-xs"
              >
                View All Tags →
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map(tag => {
                const tagCount = questions.filter(q => q.tags?.includes(tag)).length;
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag} ({tagCount})
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-4">
            {filteredQuestions.length > 0 ? (
              <QuestionList 
                questions={filteredQuestions} 
                onVote={onVote} 
                onTagClick={handleTagClickFromCard}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {searchTerm || selectedTag !== "all" 
                    ? "No questions found matching your criteria." 
                    : "No questions available yet."
                  }
                </div>
                {currentUser.role !== "guest" && (
                  <Button onClick={handleAskQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ask the First Question
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AskQuestionModal
        isOpen={isAskModalOpen}
        onRequestClose={handleCloseAskModal}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
};

export default Questions;
