import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, User } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Calendar, ArrowLeft, Reply } from "lucide-react";
import { MentionEditor } from '@/components/editor/MentionEditor';
import { useToast } from "@/hooks/use-toast";
import { useStackDetail } from "@/hooks/useApi";
import { usePagination } from "@/hooks/usePagination";
import { useNotifications } from '@/contexts/NotificationContext';

interface QuestionDetailProps {
  currentUser: User;
  onLogin: (user: User) => void;
}

export const QuestionDetail = ({ currentUser, onLogin }: QuestionDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const {
    stack,
    comments,
    loading,
    error,
    createComment,
    voteOnComment,
    voteOnStack,
  } = useStackDetail(id!);

  // Pagination for comments
  const {
    data: paginatedComments,
    pagination: commentsPagination,
    goToPage: goToCommentsPage,
    goToNextPage: goToNextCommentsPage,
    goToPreviousPage: goToPreviousCommentsPage,
    changeItemsPerPage: changeCommentsPerPage,
  } = usePagination(comments, 1, 5);

  // Mock users for mentions (in real app, this would come from API)
  const availableUsers = [
    { id: '1', username: 'john_doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
    { id: '2', username: 'jane_smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane' },
    { id: '3', username: 'tech_guru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech' },
    { id: '4', username: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
    { id: '5', username: 'code_ninja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=code' },
    { id: '6', username: 'react_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=react' },
  ];

  const handleVote = async (voteType: 'up' | 'down') => {
    if (currentUser.role === 'guest') {
      toast({
        title: "Login Required",
        description: "Please login to vote on questions.",
        variant: "destructive",
      });
      return;
    }

    await voteOnStack(voteType);
  };

  const handleCommentVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (currentUser.role === 'guest') {
      toast({
        title: "Login Required",
        description: "Please login to vote on answers.",
        variant: "destructive",
      });
      return;
    }

    await voteOnComment(commentId, voteType);
  };

  const handleMention = (mentionedUser: any, context: string) => {
    // Create notification for mentioned user
    if (mentionedUser.username !== currentUser.username) {
      addNotification({
        type: 'mention',
        title: 'Mentioned You',
        message: `${currentUser.username} mentioned you in "${stack?.title || 'a question'}"`,
        read: false,
        createdAt: 'Just now',
        relatedQuestionId: id,
        fromUser: {
          name: currentUser.username,
          avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`
        }
      });

      toast({
        title: "User Mentioned",
        description: `@${mentionedUser.username} will be notified about your mention.`,
        duration: 3000,
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (currentUser.role === 'guest') {
      toast({
        title: "Login Required",
        description: "Please login to post answers.",
        variant: "destructive",
      });
      return;
    }

    const plainTextComment = newComment.replace(/<[^>]*>/g, '').trim();
    if (plainTextComment.length < 10) {
      toast({
        title: "Answer too short",
        description: "Answers must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingComment(true);

    try {
      await createComment({ text: newComment });
      setNewComment('');
      
      // Check for mentions in the comment and create notifications
      const mentionRegex = /@(\w+)/g;
      const mentions = newComment.match(mentionRegex);
      
      if (mentions) {
        mentions.forEach(mention => {
          const username = mention.substring(1); // Remove @ symbol
          const mentionedUser = availableUsers.find(user => user.username === username);
          
          if (mentionedUser && mentionedUser.username !== currentUser.username) {
            addNotification({
              type: 'mention',
              title: 'Mentioned in Answer',
              message: `${currentUser.username} mentioned you in an answer to "${stack?.title || 'a question'}"`,
              read: false,
              createdAt: 'Just now',
              relatedQuestionId: id,
              fromUser: {
                name: currentUser.username,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`
              }
            });
          }
        });
      }

      toast({
        title: "Answer Posted",
        description: "Your answer has been posted successfully.",
        duration: 3000,
      });
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={currentUser} onLogin={onLogin} />
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stack) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={currentUser} onLogin={onLogin} />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
            <p className="text-muted-foreground mb-4">The question you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/questions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onLogin={onLogin} />

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate('/questions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>

            {/* Question Card */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleVote('up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg">{stack.voteScore || 0}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleVote('down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">{stack.title}</h1>
                    <div 
                      className="prose prose-sm max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: stack.description }}
                    />
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stack.tags?.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Author and Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(stack.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stack.creator?.username}`} />
                          <AvatarFallback>{stack.creator?.username?.[0] || 'A'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{stack.creator?.username || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Comments Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {comments.length} Answer{comments.length !== 1 ? 's' : ''}
              </h2>
              
              <div className="space-y-6">
                {paginatedComments.map((comment: any) => (
                  <Card key={comment._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2 min-w-[50px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCommentVote(comment._id, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{comment.voteScore || 0}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCommentVote(comment._id, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div 
                            className="prose prose-sm max-w-none mb-4"
                            dangerouslySetInnerHTML={{ __html: comment.text }}
                          />
                          
                          {/* Author Info */}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.username}`} />
                              <AvatarFallback>{comment.author?.username?.[0] || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{comment.author?.username || 'Anonymous'}</span>
                            <span>•</span>
                            <span className="text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comments Pagination */}
              {commentsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousCommentsPage}
                      disabled={commentsPagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {commentsPagination.currentPage} of {commentsPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextCommentsPage}
                      disabled={commentsPagination.currentPage === commentsPagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Comment Section with Enhanced MentionEditor */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Reply className="h-5 w-5" />
                  Your Answer
                </h3>
                
                {currentUser.role === 'guest' ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">You need to be logged in to post an answer.</p>
                    <Button onClick={() => navigate('/login')}>
                      Login to Answer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <MentionEditor
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Write your answer here... (minimum 10 characters, type @ to mention users)"
                      users={availableUsers}
                      onMention={handleMention}
                      currentUser={currentUser}
                      questionTitle={stack.title}
                      questionId={id}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {newComment.replace(/<[^>]*>/g, '').length} characters (minimum 10)
                      </div>
                      <Button
                        onClick={handleCommentSubmit}
                        disabled={isSubmittingComment || newComment.replace(/<[^>]*>/g, '').trim().length < 10}
                        className="min-w-[120px]"
                      >
                        {isSubmittingComment ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Posting...</span>
                          </div>
                        ) : (
                          'Post Answer'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Question Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asked</span>
                  <span>{new Date(stack.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>{stack.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <span>{comments.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
