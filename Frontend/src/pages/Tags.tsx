import React, { useState, useMemo } from "react";
import { Header, User } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Plus, Search, Hash, TrendingUp, Clock } from "lucide-react";
import AskQuestionModal from "@/components/layout/AskQuestionModal";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";

interface TagsProps {
  currentUser: User;
  onLogin: (user: User) => void;
  questions: any[];
  onAddQuestion: (question: any) => void;
}

const Tags = ({ currentUser, onLogin, questions, onAddQuestion }: TagsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate tag statistics
  const tagStats = useMemo(() => {
    const tagMap = new Map<string, {
      count: number;
      totalVotes: number;
      totalAnswers: number;
      recentQuestions: any[];
    }>();

    questions.forEach(question => {
      question.tags?.forEach((tag: string) => {
        const existing = tagMap.get(tag) || {
          count: 0,
          totalVotes: 0,
          totalAnswers: 0,
          recentQuestions: []
        };

        existing.count += 1;
        existing.totalVotes += question.votes || 0;
        existing.totalAnswers += question.answers || 0;
        existing.recentQuestions.push(question);

        tagMap.set(tag, existing);
      });
    });

    return Array.from(tagMap.entries()).map(([tag, stats]) => ({
      name: tag,
      ...stats,
      avgVotes: Math.round(stats.totalVotes / stats.count),
      recentQuestions: stats.recentQuestions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
    })).sort((a, b) => b.count - a.count);
  }, [questions]);

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tagStats;
    return tagStats.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tagStats, searchTerm]);

  // Pagination for tags
  const {
    data: paginatedTags,
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeItemsPerPage,
  } = usePagination(filteredTags, 1, 12);

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

  const handleTagClick = (tagName: string) => {
    navigate(`/questions?tag=${encodeURIComponent(tagName)}`);
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
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Hash className="h-8 w-8" />
                Tags
              </h1>
              <p className="text-muted-foreground">
                Explore topics and find questions by technology, framework, or subject
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

      {/* Search and Stats */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{pagination.totalItems} tags</span>
              <span>{questions.length} questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="container py-8">
        {pagination.totalItems > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedTags.map((tag) => (
                <Card
                  key={tag.name}
                  className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                  onClick={() => handleTagClick(tag.name)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-sm font-medium">
                        {tag.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {tag.count} question{tag.count !== 1 ? 's' : ''}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{tag.avgVotes} avg votes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{tag.totalAnswers} answers</span>
                        </div>
                      </div>

                      {/* Recent Questions */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Recent questions:</p>
                        <div className="space-y-1">
                          {tag.recentQuestions.slice(0, 2).map((question) => (
                            <div
                              key={question.id}
                              className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/question/${question.id}`);
                              }}
                            >
                              {question.title}
                            </div>
                          ))}
                          {tag.recentQuestions.length === 0 && (
                            <div className="text-xs text-muted-foreground italic">
                              No recent questions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination Controls */}
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={goToPage}
              onNextPage={goToNextPage}
              onPreviousPage={goToPreviousPage}
              onItemsPerPageChange={changeItemsPerPage}
              itemsPerPageOptions={[8, 12, 24, 48]}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No tags found matching "${searchTerm}"` 
                : "No tags available yet."
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

      <AskQuestionModal
        isOpen={isAskModalOpen}
        onRequestClose={handleCloseAskModal}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
};

export default Tags;
