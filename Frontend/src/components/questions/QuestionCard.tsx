import { ArrowUp, ArrowDown, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { User } from "@/components/layout/Header";

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    content: string;
    author: {
      name: string;
      avatar?: string;
      reputation: number;
    };
    votes: number;
    answers: number;
    tags: string[];
    createdAt: string;
    isAccepted?: boolean;
    userVote?: 'up' | 'down' | null;
  };
  currentUser?: User;
  onVote?: (questionId: string, voteType: 'up' | 'down') => void;
  onTagClick?: (tag: string) => void;
  onDelete?: (questionId: string) => void;
}

export const QuestionCard = ({ question, currentUser, onVote, onTagClick, onDelete }: QuestionCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };

  const handleVoteClick = (e: React.MouseEvent, voteType?: 'up' | 'down') => {
    e.stopPropagation(); // Prevent card click when voting
    if (voteType && onVote) {
      onVote(question.id, voteType);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    if (onDelete && window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      onDelete(question.id);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation(); // Prevent card click when clicking tag
    if (onTagClick) {
      onTagClick(tag);
    } else {
      // If no onTagClick handler, navigate to questions page with tag filter
      navigate(`/questions?tag=${encodeURIComponent(tag)}`);
    }
  };

  const {
    title,
    content,
    author,
    votes,
    tags,
    createdAt,
    userVote,
  } = question;

  return (
    <Card 
      className="p-6 shadow-question hover:shadow-card transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex gap-6">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 min-w-fit">
          {/* Votes */}
          <div className="flex flex-col items-center space-y-1">
            <Button 
              variant="vote" 
              size="sm" 
              onClick={(e) => handleVoteClick(e, 'up')}
              className={userVote === 'up' ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : ''}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold text-foreground">{votes}</span>
            <Button 
              variant="vote" 
              size="sm" 
              onClick={(e) => handleVoteClick(e, 'down')}
              className={userVote === 'down' ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : ''}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col space-y-3">
            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer line-clamp-2">
              {title}
            </h3>
            
            {/* Content preview */}
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {content}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Footer - Author and timestamp only */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{createdAt}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Admin delete button */}
                {currentUser?.role === 'admin' && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteClick}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    title="Delete question (Admin only)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Author info */}
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-foreground">
                    {author.name}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};