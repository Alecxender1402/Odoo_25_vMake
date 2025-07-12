import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Plus, X } from "lucide-react";
import { MentionEditor } from "@/components/editor/MentionEditor";
import { useToast } from "@/hooks/use-toast";

interface AskQuestionModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (question: { title: string; description: string; tags: string[] }) => void;
}

const AskQuestionModal = ({ isOpen, onRequestClose, onSubmit }: AskQuestionModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Mock current user for mentions (in real app, this would come from auth context)
  const currentUser = {
    username: 'current_user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    const plainDescription = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!plainDescription) {
      newErrors.description = 'Description is required';
    } else if (plainDescription.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      tags: []
    });
    setCurrentTag('');
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onRequestClose();
  };

  const addTag = () => {
    const tag = currentTag.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCurrentTag('');
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleMention = (user: any, context: string) => {
    toast({
      title: "User Mentioned",
      description: `@${user.username} will be notified when you post this question.`,
      duration: 3000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Ask a Question
          </DialogTitle>
          <DialogDescription>
            Share your programming question with the community. Be specific and provide enough detail for others to understand and help.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Question Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., How to implement authentication in React?"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              className={errors.title ? 'border-red-500' : ''}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters (minimum 10)
            </p>
          </div>

          {/* Description with Mention Support */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Question Description *
            </Label>
            <MentionEditor
              value={formData.description}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, description: value }));
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              placeholder="Describe your problem in detail. Include what you've tried and what you expected to happen..."
              onMention={handleMention}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.replace(/<[^>]*>/g, '').length} characters (minimum 20)
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tags * (up to 10)
            </Label>
            
            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Tag Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., javascript, react, typescript"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className={errors.tags ? 'border-red-500' : ''}
                disabled={formData.tags.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!currentTag.trim() || formData.tags.includes(currentTag.trim()) || formData.tags.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {errors.tags && (
              <p className="text-sm text-red-500">{errors.tags}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Add tags to help others find and answer your question ({formData.tags.length}/10)
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || !formData.description.trim() || formData.tags.length === 0}
            >
              Post Question
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AskQuestionModal;