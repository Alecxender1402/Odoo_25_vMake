import React, { useState, useMemo } from "react";
import { Header, User } from "@/components/layout/Header";
import { QuestionList } from "@/components/questions/QuestionList";
import { FilterSidebar } from "@/components/sidebar/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/layout/Footer";
import { usePagination } from "@/hooks/usePagination";
import { Plus, Search, Filter, TrendingUp, Clock, MessageSquare } from "lucide-react";
import AskQuestionModal from "@/components/layout/AskQuestionModal";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

interface QuestionsProps {
  currentUser: User;
  onLogin: (user: User) => void;
  questions: any[];
  onAddQuestion: (question: any) => void;
  onVote: (questionId: string, voteType: 'up' | 'down') => void;
  onDeleteQuestion: (questionId: string) => void;
}

const Questions = ({ 
  currentUser, 
  onLogin, 
  questions, 
  onAddQuestion, 
  onVote, 
  onDeleteQuestion 
}: QuestionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  
  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(q => 
        q.tags.some((tag: string) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Sort questions
    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      case 'unanswered':
        return filtered.filter(q => (q.answers || 0) === 0).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'newest':
      default:
        return filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [questions, searchTerm, sortBy, selectedTag]);

  // Pagination
  const {
    data: paginatedQuestions,
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeItemsPerPage,
  } = usePagination(filteredAndSortedQuestions, 1, 10);

  // Update URL when filters change
  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Modal handlers
  const handleAskQuestion = () => setIsAskModalOpen(true);
  const handleCloseAskModal = () => setIsAskModalOpen(false);

  // Fix: Handle new question submission with proper data structure
  const handleQuestionSubmit = async (questionData: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    try {
      console.log('Question form data:', questionData);
      
      // Validate required fields
      if (!questionData.title?.trim() || !questionData.description?.trim() || !questionData.tags?.length) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Call the parent handler with the correct data structure
      await onAddQuestion(questionData);
      
      // Close modal on success
      handleCloseAskModal();
      
    } catch (error: any) {
      console.error('Error in question submission:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName);
    updateSearchParams('tag', tagName);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateSearchParams('search', value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateSearchParams('sort', value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        currentUser={currentUser}
        onLogin={onLogin}
        onAskQuestion={handleAskQuestion}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="h-8 w-8" />
                All Questions
              </h1>
              <p className="text-muted-foreground">
                Find answers to your programming questions
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
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Newest
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="unanswered">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Unanswered
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedTag || sortBy !== 'newest') && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedTag || searchTerm) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedTag && (
                <Badge variant="secondary" className="gap-1">
                  Tag: {selectedTag}
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      updateSearchParams('tag', '');
                    }}
                    className="ml-1 hover:bg-muted-foreground/20 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      updateSearchParams('search', '');
                    }}
                    className="ml-1 hover:bg-muted-foreground/20 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>{pagination.totalItems} questions</span>
              <span>Showing {pagination.startIndex + 1}-{pagination.endIndex} of {pagination.totalItems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Questions */}
          <div className="lg:col-span-3">
            {paginatedQuestions.length > 0 ? (
              <QuestionList
                questions={paginatedQuestions}
                currentUser={currentUser}
                onVote={onVote}
                onTagClick={handleTagClick}
                onDelete={onDeleteQuestion}
              />
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground mb-4">
                  {searchTerm || selectedTag
                    ? `No questions found matching your criteria.`
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>
        </div>
      </div>

      {/* Footer with Pagination */}
      <Footer
        showPagination={pagination.totalPages > 1}
        paginationProps={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          startIndex: pagination.startIndex,
          endIndex: pagination.endIndex,
          hasNextPage: pagination.currentPage < pagination.totalPages,
          hasPreviousPage: pagination.currentPage > 1,
          onPageChange: goToPage,
          onNextPage: goToNextPage,
          onPreviousPage: goToPreviousPage,
          onItemsPerPageChange: changeItemsPerPage,
          itemsPerPageOptions: [5, 10, 20, 50]
        }}
      />

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onRequestClose={handleCloseAskModal}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
};

export default Questions;
