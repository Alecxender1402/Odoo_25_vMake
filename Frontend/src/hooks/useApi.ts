import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Stack {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  creator?: {
    username: string;
  };
  comments?: any[];
  voteScore?: number;
  upvotes?: number;
  downvotes?: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
  solution?: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

export const useStacks = () => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Making request to:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stacks`, 'with options:', undefined);
      
      const response = await apiClient.getStacks();
      
      console.log('Stacks response:', response);
      console.log('First stack ID:', response[0]?._id, 'Type:', typeof response[0]?._id);
      
      setStacks(response || []);
    } catch (err: any) {
      console.error('Error fetching stacks:', err);
      setError(err.message || 'Failed to fetch questions');
      setStacks([]);
      
      toast({
        title: "Failed to Load Questions",
        description: err.message || "Could not load questions. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createStack = useCallback(async (stackData: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    try {
      console.log('Creating stack with data:', stackData);
      
      const response = await apiClient.createStack(stackData);
      console.log('Create stack response:', response);
      console.log('New stack ID:', response._id, 'Type:', typeof response._id);
      
      // Add the new stack to the beginning of the list
      setStacks(prev => [response, ...prev]);
      
      return response;
    } catch (err: any) {
      console.error('Error creating stack:', err);
      throw new Error(err.message || 'Failed to create question');
    }
  }, []);

  const voteOnStack = useCallback(async (stackId: string, voteType: 'up' | 'down') => {
    try {
      console.log('Voting on stack:', stackId, 'Type:', voteType);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stacks/${stackId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: voteType })
      });
      
      if (!response.ok) {
        throw new Error('Vote failed');
      }
      
      const updatedStack = await response.json();
      console.log('Vote response:', updatedStack);
      
      // Update the stack in the list
      setStacks(prev => prev.map(stack => 
        stack._id === stackId ? updatedStack : stack
      ));
      
    } catch (err: any) {
      console.error('Error voting on stack:', err);
      throw new Error(err.message || 'Failed to vote on question');
    }
  }, []);

  const deleteStack = useCallback(async (stackId: string) => {
    try {
      console.log('Deleting stack:', stackId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stacks/${stackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      
      // Remove the stack from the list
      setStacks(prev => prev.filter(stack => stack._id !== stackId));
      
    } catch (err: any) {
      console.error('Error deleting stack:', err);
      throw new Error(err.message || 'Failed to delete question');
    }
  }, []);

  // Fetch stacks on component mount
  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  return {
    stacks,
    loading,
    error,
    fetchStacks,
    createStack,
    voteOnStack,
    deleteStack
  };
};

export const useStackDetail = (stackId: string) => {
  const [stack, setStack] = useState<Stack | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStackDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching stack detail for ID:', stackId, 'Type:', typeof stackId);
      
      const [stackResponse, commentsResponse] = await Promise.all([
        apiClient.getStack(stackId),
        apiClient.getComments(stackId)
      ]);
      
      console.log('Stack detail response:', stackResponse);
      console.log('Comments response:', commentsResponse);
      
      setStack(stackResponse);
      setComments(commentsResponse || []);
    } catch (err: any) {
      console.error('Error fetching stack detail:', err);
      setError(err.message || 'Failed to fetch question details');
    } finally {
      setLoading(false);
    }
  }, [stackId]);

  const createComment = useCallback(async (commentData: { text: string }) => {
    try {
      const response = await apiClient.createComment(stackId, commentData.text);
      setComments(prev => [response, ...prev]);
      return response;
    } catch (err: any) {
      console.error('Error creating comment:', err);
      throw new Error(err.message || 'Failed to create comment');
    }
  }, [stackId]);

  const voteOnComment = useCallback(async (commentId: string, voteType: 'up' | 'down') => {
    try {
      const response = await apiClient.voteOnComment(stackId, commentId, voteType);
      setComments(prev => prev.map(comment => 
        comment._id === commentId ? response : comment
      ));
      return response;
    } catch (err: any) {
      console.error('Error voting on comment:', err);
      throw new Error(err.message || 'Failed to vote on comment');
    }
  }, [stackId]);

  const voteOnStack = useCallback(async (voteType: 'up' | 'down') => {
    try {
      const response = await apiClient.voteOnStack(stackId, voteType);
      setStack(response);
      return response;
    } catch (err: any) {
      console.error('Error voting on stack:', err);
      throw new Error(err.message || 'Failed to vote on question');
    }
  }, [stackId]);

  useEffect(() => {
    if (stackId) {
      fetchStackDetail();
    }
  }, [fetchStackDetail]);

  return {
    stack,
    comments,
    loading,
    error,
    createComment,
    voteOnComment,
    voteOnStack,
  };
};