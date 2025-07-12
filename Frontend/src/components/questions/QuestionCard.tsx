import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUp, ArrowDown, MessageSquare, Eye, Calendar, CheckCircle, Pin, Trash2 } from "lucide-react";
import { AdminControls } from "../admin/AdminControls";
import { Link } from "react-router-dom";

interface QuestionCardProps {
  question: any;
  currentUser: any;
  onVote?: (questionId: string, voteType: 'up' | 'down') => void;
  onTagClick?: (tag: string) => void;
  onDelete?: (questionId: string) => void;
}

export const QuestionCard = ({ question, currentUser, onVote, onTagClick, onDelete }: QuestionCardProps) => {
  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(question.id, voteType);
    }
  };

  const handleAdminAction = async (action: string, itemId: string) => {
    switch (action) {
      case 'delete':
        if (onDelete) {
          onDelete(itemId);
        }
        break;
      case 'pin':
        // Handle pin logic
        console.log('Pinning question:', itemId);
        break;
      case 'lock':
        // Handle lock logic
        console.log('Locking question:', itemId);
        break;
      default:
        console.log('Admin action:', action, itemId);
    }
  };

  const handleAdminDelete = () => {
    if (onDelete && currentUser?.role === 'admin') {
      onDelete(question.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Pinned indicator */}
            {question.isPinned && (
              <div className="flex items-center mb-2 text-sm text-orange-600">
                <Pin className="h-4 w-4 mr-1" />
                <span className="font-medium">Pinned</span>
              </div>
            )}
            
            <Link 
              to={`/question/${question.id}`}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {question.title}
            </Link>
            
            {/* Render HTML content properly */}
            <div 
              className="text-muted-foreground mt-2 line-clamp-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
          </div>
          
          {/* Admin Controls */}
          {currentUser?.role === 'admin' && (
            <AdminControls
              currentUser={currentUser}
              itemType="question"
              item={question}
              onAction={handleAdminAction}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {question.tags?.map((tag: string, index: number) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onTagClick && onTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          {/* Left side: Stats */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{question.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers || 0} answers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{question.createdAt}</span>
            </div>
            {question.isAccepted && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Accepted</span>
              </div>
            )}
          </div>

          {/* Right side: Vote buttons, Admin Delete, and Author */}
          <div className="flex items-center space-x-4">
            {/* Vote buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 vote-button ${question.userVote === 'up' ? 'active text-green-600' : ''}`}
                onClick={() => handleVote('up')}
                disabled={currentUser?.role === 'guest'}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[2rem] text-center">{question.votes || 0}</span>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 vote-button ${question.userVote === 'down' ? 'active text-red-600' : ''}`}
                onClick={() => handleVote('down')}
                disabled={currentUser?.role === 'guest'}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Admin Delete Button */}
            {currentUser?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleAdminDelete}
                title="Delete Question (Admin)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Author */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={question.author?.avatar} />
                <AvatarFallback>{question.author?.name?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{question.author?.name || 'Anonymous'}</div>
                <div className="text-xs text-muted-foreground">
                  {question.author?.reputation || 0} rep
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};