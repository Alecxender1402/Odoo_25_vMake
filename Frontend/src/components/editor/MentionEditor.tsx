import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface MentionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  users?: User[];
  onMention?: (user: User, context: string) => void;
  currentUser?: any;
  questionTitle?: string;
  questionId?: string;
  context?: 'question' | 'answer'; // New prop to distinguish context
}

export const MentionEditor: React.FC<MentionEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your message...",
  users = [],
  onMention,
  currentUser,
  questionTitle,
  questionId,
  context = 'answer'
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [lastAtPosition, setLastAtPosition] = useState(-1);
  const quillRef = useRef<ReactQuill>(null);
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  // Mock users if none provided
  const defaultUsers: User[] = [
    { id: '1', username: 'john_doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
    { id: '2', username: 'jane_smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane' },
    { id: '3', username: 'tech_guru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech' },
    { id: '4', username: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
    { id: '5', username: 'code_ninja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=code' },
    { id: '6', username: 'react_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=react' },
  ];

  const allUsers = users.length > 0 ? users : defaultUsers;

  // Filter users based on mention query (exclude current user)
  const filteredUsers = mentionQuery
    ? allUsers.filter(user =>
        user.username.toLowerCase().includes(mentionQuery.toLowerCase()) &&
        user.username !== currentUser?.username
      )
    : allUsers.filter(user => user.username !== currentUser?.username);

  const handleTextChange = (content: string) => {
    onChange(content);

    // Convert HTML to plain text for @ detection
    const plainText = content.replace(/<[^>]*>/g, '');
    const atIndex = plainText.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterAt = plainText.slice(atIndex + 1);
      const spaceIndex = afterAt.search(/\s/);
      const query = spaceIndex === -1 ? afterAt : afterAt.slice(0, spaceIndex);

      if (spaceIndex === -1 && query.length >= 0) {
        setMentionQuery(query);
        setLastAtPosition(atIndex);
        setShowMentions(true);
        setSelectedMentionIndex(0);
        
        // Position mention dropdown (simplified)
        setMentionPosition({ top: 100, left: 20 });
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const plainText = value.replace(/<[^>]*>/g, '');
    const beforeAt = plainText.slice(0, lastAtPosition);
    const afterQuery = plainText.slice(lastAtPosition + 1 + mentionQuery.length);
    
    const newContent = `${beforeAt}@${user.username} ${afterQuery}`;
    onChange(newContent);
    
    // Trigger notification for mentioned user
    if (onMention) {
      onMention(user, newContent);
    }
    
    // Create notification for the mentioned user
    if (currentUser && user.username !== currentUser.username) {
      const contextMessage = context === 'question' 
        ? `mentioned you in their question${questionTitle ? `: "${questionTitle}"` : ''}`
        : `mentioned you in an answer${questionTitle ? ` to: "${questionTitle}"` : ''}`;

      addNotification({
        type: 'mention',
        title: 'Mentioned You',
        message: `${currentUser.username} ${contextMessage}`,
        read: false,
        createdAt: 'Just now',
        relatedQuestionId: questionId,
        fromUser: {
          name: currentUser.username,
          avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`
        }
      });

      toast({
        title: "User Mentioned",
        description: `@${user.username} will be notified about your mention.`,
        duration: 3000,
      });
    }

    setShowMentions(false);
    setMentionQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          insertMention(filteredUsers[selectedMentionIndex]);
          break;
        case 'Escape':
          setShowMentions(false);
          setMentionQuery('');
          break;
      }
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link', 'code-block'
  ];

  const contextPlaceholder = context === 'question'
    ? `${placeholder} (Type @ to mention users)`
    : `${placeholder} (minimum 10 characters, type @ to mention users)`;

  return (
    <div className="relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        modules={modules}
        formats={formats}
        placeholder={contextPlaceholder}
        className="min-h-[200px]"
      />

      {/* Mention Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <div 
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto w-64"
          style={{ 
            top: mentionPosition.top, 
            left: mentionPosition.left 
          }}
        >
          <div className="p-2 text-sm text-gray-500 border-b">
            Mention a user
          </div>
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              className={`w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 ${
                index === selectedMentionIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
              }`}
              onClick={() => insertMention(user)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">@{user.username}</span>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-3 text-sm text-gray-500 text-center">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};