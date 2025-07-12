import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'answer' | 'comment' | 'mention';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedQuestionId?: string;
  relatedAnswerId?: string;
  fromUser: {
    name: string;
    avatar?: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const initialState: NotificationState = {
  notifications: [
    {
      id: '1',
      type: 'answer',
      title: 'New Answer',
      message: 'Sarah Chen answered your question about React Context API',
      read: false,
      createdAt: '2 minutes ago',
      relatedQuestionId: '1',
      fromUser: {
        name: 'Sarah Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
      }
    },
    {
      id: '2',
      type: 'comment',
      title: 'New Comment',
      message: 'Mike Johnson commented on your answer about state management',
      read: false,
      createdAt: '15 minutes ago',
      relatedQuestionId: '2',
      fromUser: {
        name: 'Mike Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
      }
    },
    {
      id: '3',
      type: 'mention',
      title: 'Mentioned You',
      message: 'Alex Rodriguez mentioned you in a comment: "@' + 'currentUser' + ' have you tried using React.memo?"',
      read: true,
      createdAt: '1 hour ago',
      relatedQuestionId: '3',
      fromUser: {
        name: 'Alex Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
      }
    },
    {
      id: '4',
      type: 'answer',
      title: 'New Answer',
      message: 'Emma Thompson provided a detailed answer to your TypeScript question',
      read: true,
      createdAt: '3 hours ago',
      relatedQuestionId: '4',
      fromUser: {
        name: 'Emma Thompson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
      }
    }
  ],
  unreadCount: 2
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: state.unreadCount - 1
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      };
    case 'REMOVE_NOTIFICATION':
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: notificationToRemove && !notificationToRemove.read 
          ? state.unreadCount - 1 
          : state.unreadCount
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    default:
      return state;
  }
}

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  return (
    <NotificationContext.Provider value={{
      state,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
