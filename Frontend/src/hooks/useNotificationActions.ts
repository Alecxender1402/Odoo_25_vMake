import { useNotifications } from '@/contexts/NotificationContext';
import { User } from '@/components/layout/Header';

export const useNotificationActions = (currentUser: User) => {
  const { addNotification } = useNotifications();

  const notifyNewAnswer = (questionAuthor: string, questionTitle: string, questionId: string, answererName: string, answererAvatar?: string) => {
    if (questionAuthor === currentUser.username) {
      addNotification({
        type: 'answer',
        title: 'New Answer',
        message: `${answererName} answered your question: "${questionTitle}"`,
        read: false,
        createdAt: 'Just now',
        relatedQuestionId: questionId,
        fromUser: {
          name: answererName,
          avatar: answererAvatar
        }
      });
    }
  };

  const notifyNewComment = (targetUser: string, questionTitle: string, questionId: string, commenterName: string, commenterAvatar?: string) => {
    if (targetUser === currentUser.username) {
      addNotification({
        type: 'comment',
        title: 'New Comment',
        message: `${commenterName} commented on your answer in "${questionTitle}"`,
        read: false,
        createdAt: 'Just now',
        relatedQuestionId: questionId,
        fromUser: {
          name: commenterName,
          avatar: commenterAvatar
        }
      });
    }
  };

  const notifyMention = (mentionedUser: string, questionTitle: string, questionId: string, mentionerName: string, context: string, mentionerAvatar?: string) => {
    if (mentionedUser === currentUser.username) {
      addNotification({
        type: 'mention',
        title: 'Mentioned You',
        message: `${mentionerName} mentioned you in "${questionTitle}": ${context}`,
        read: false,
        createdAt: 'Just now',
        relatedQuestionId: questionId,
        fromUser: {
          name: mentionerName,
          avatar: mentionerAvatar
        }
      });
    }
  };

  return {
    notifyNewAnswer,
    notifyNewComment,
    notifyMention
  };
};
