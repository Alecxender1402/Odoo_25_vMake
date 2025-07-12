import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, User } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, ArrowDown, MessageSquare, Eye, Calendar, ArrowLeft, Reply } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  votes: number;
  createdAt: string;
  userVote?: 'up' | 'down' | null;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  createdAt: string;
  isAccepted: boolean;
  userVote?: 'up' | 'down' | null;
}

interface QuestionDetailProps {
  currentUser: User;
  onLogin: (user: User) => void;
  questions: Question[];
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onAddComment: (questionId: string, comment: Omit<Comment, 'id'>) => void;
}

// Toolbar configuration for comments
const commentToolbarOptions = [
  [{ 'header': [3, false] }],
  ['bold', 'italic', 'underline'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['link', 'code-block'],
  ['clean']
];

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    content: "<p>Great question! You can use React Context by creating a context with <code>createContext()</code> and then providing it with a Provider component.</p>",
    author: {
      name: "John Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      reputation: 1250
    },
    votes: 8,
    createdAt: "30 minutes ago",
    userVote: null
  },
  {
    id: "2",
    content: "<p>Here's a simple example:</p><pre><code>const MyContext = createContext();\n\nfunction App() {\n  return (\n    &lt;MyContext.Provider value={someValue}&gt;\n      &lt;ChildComponent /&gt;\n    &lt;/MyContext.Provider&gt;\n  );\n}</code></pre>",
    author: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      reputation: 2100
    },
    votes: 12,
    createdAt: "15 minutes ago",
    userVote: null
  }
];

export const QuestionDetail = ({ currentUser, onLogin, questions, onUpdateQuestion, onAddComment }: QuestionDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    // Find the question by ID
    const foundQuestion = questions.find(q => q.id === id);
    if (foundQuestion) {
      // Increment view count
      const updatedQuestion = { ...foundQuestion, views: foundQuestion.views + 1 };
      setQuestion(updatedQuestion);
      onUpdateQuestion(id!, { views: updatedQuestion.views });
    } else {
      // Redirect to home if question not found
      navigate('/');
    }
  }, [id, questions, navigate, onUpdateQuestion]);

  const handleVote = (type: 'up' | 'down', targetType: 'question' | 'comment', targetId?: string) => {
    if (currentUser.role === 'guest' || !currentUser.username) {
      toast({
        title: "Login Required",
        description: "Please login to vote on questions and comments.",
        variant: "destructive",
      });
      return;
    }

    if (targetType === 'question' && question) {
      const currentVote = question.userVote;
      let newVotes = question.votes;
      let newUserVote: 'up' | 'down' | null = type;

      // Calculate vote changes
      if (currentVote === type) {
        // Remove vote
        newVotes += type === 'up' ? -1 : 1;
        newUserVote = null;
      } else if (currentVote) {
        // Change vote
        newVotes += type === 'up' ? 2 : -2;
      } else {
        // Add new vote
        newVotes += type === 'up' ? 1 : -1;
      }

      const updatedQuestion = { ...question, votes: newVotes, userVote: newUserVote };
      setQuestion(updatedQuestion);
      onUpdateQuestion(question.id, { votes: newVotes, userVote: newUserVote });

      toast({
        title: newUserVote ? `${type === 'up' ? 'Upvoted' : 'Downvoted'}!` : "Vote removed",
        description: `Question ${newUserVote ? (type === 'up' ? 'upvoted' : 'downvoted') : 'vote removed'} successfully.`,
      });
    } else if (targetType === 'comment' && targetId) {
      setComments(prev => prev.map(comment => {
        if (comment.id === targetId) {
          const currentVote = comment.userVote;
          let newVotes = comment.votes;
          let newUserVote: 'up' | 'down' | null = type;

          if (currentVote === type) {
            newVotes += type === 'up' ? -1 : 1;
            newUserVote = null;
          } else if (currentVote) {
            newVotes += type === 'up' ? 2 : -2;
          } else {
            newVotes += type === 'up' ? 1 : -1;
          }

          return { ...comment, votes: newVotes, userVote: newUserVote };
        }
        return comment;
      }));

      toast({
        title: `Comment ${type === 'up' ? 'upvoted' : 'downvoted'}!`,
        description: "Your vote has been recorded.",
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (currentUser.role === 'guest' || !currentUser.username) {
      toast({
        title: "Login Required",
        description: "Please login to post comments.",
        variant: "destructive",
      });
      return;
    }

    const plainTextComment = newComment.replace(/<[^>]*>/g, '').trim();
    if (plainTextComment.length < 10) {
      toast({
        title: "Comment too short",
        description: "Comments must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingComment(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment: Comment = {
        id: (comments.length + 1).toString(),
        content: newComment,
        author: {
          name: currentUser.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
          reputation: currentUser.role === 'admin' ? 2000 : 150
        },
        votes: 0,
        createdAt: "Just now",
        userVote: null
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');

      // Update question answer count
      if (question) {
        const updatedQuestion = { ...question, answers: question.answers + 1 };
        setQuestion(updatedQuestion);
        onUpdateQuestion(question.id, { answers: updatedQuestion.answers });
      }

      toast({
        title: "Comment Posted!",
        description: "Your comment has been added successfully.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  const quillModules = {
    toolbar: commentToolbarOptions,
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link', 'code-block'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        onLogin={onLogin}
        onAskQuestion={() => {}}
      />

      <div className="container py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Question */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote('up', 'question')}
                      className={`p-2 hover:bg-green-50 ${
                        question.userVote === 'up' ? 'bg-green-100 text-green-600' : 'text-gray-500'
                      }`}
                      disabled={currentUser.role === 'guest'}
                    >
                      <ArrowUp className="h-6 w-6" />
                    </Button>
                    <span className={`text-lg font-semibold ${
                      question.votes > 0 ? 'text-green-600' : 
                      question.votes < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {question.votes}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote('down', 'question')}
                      className={`p-2 hover:bg-red-50 ${
                        question.userVote === 'down' ? 'bg-red-100 text-red-600' : 'text-gray-500'
                      }`}
                      disabled={currentUser.role === 'guest'}
                    >
                      <ArrowDown className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
                    <div 
                      className="prose prose-sm max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: question.content }}
                    />
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Author and Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{question.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{question.answers} answers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{question.createdAt}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={question.author.avatar} />
                          <AvatarFallback>{question.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{question.author.name}</span>
                        <span className="text-xs">({question.author.reputation} rep)</span>
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
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2 min-w-[50px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote('up', 'comment', comment.id)}
                            className={`p-1 hover:bg-green-50 ${
                              comment.userVote === 'up' ? 'bg-green-100 text-green-600' : 'text-gray-500'
                            }`}
                            disabled={currentUser.role === 'guest'}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <span className={`text-sm font-semibold ${
                            comment.votes > 0 ? 'text-green-600' : 
                            comment.votes < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {comment.votes}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote('down', 'comment', comment.id)}
                            className={`p-1 hover:bg-red-50 ${
                              comment.userVote === 'down' ? 'bg-red-100 text-red-600' : 'text-gray-500'
                            }`}
                            disabled={currentUser.role === 'guest'}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div 
                            className="prose prose-sm max-w-none mb-3"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{comment.createdAt}</span>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={comment.author.avatar} />
                                <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{comment.author.name}</span>
                              <span className="text-xs">({comment.author.reputation} rep)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Add Comment Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Reply className="h-5 w-5 mr-2" />
                  Your Answer
                </h3>
              </CardHeader>
              <CardContent>
                {currentUser.role === 'guest' || !currentUser.username ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">Please login to post an answer.</p>
                    <Button onClick={() => navigate('/login')}>
                      Login to Answer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ReactQuill
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Write your answer here. Provide details and share your knowledge!"
                      style={{ minHeight: 150 }}
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-white"
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
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
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Asked:</span>
                  <span>{question.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span>{question.views}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answers:</span>
                  <span>{question.answers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className={`font-semibold ${
                    question.votes > 0 ? 'text-green-600' : 
                    question.votes < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {question.votes}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
