import React from 'react';
import { Bell, MessageCircle, MessageSquare, AtSign, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'answer':
      return <MessageCircle className="h-4 w-4 text-green-500" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'mention':
      return <AtSign className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNavigate: (questionId?: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onNavigate
}) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.relatedQuestionId) {
      onNavigate(notification.relatedQuestionId);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  return (
    <div
      className={cn(
        "p-3 border-b cursor-pointer transition-colors hover:bg-muted/50",
        !notification.read && "bg-primary/5 border-l-2 border-l-primary"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={notification.fromUser.avatar} alt={notification.fromUser.name} />
          <AvatarFallback>{notification.fromUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getNotificationIcon(notification.type)}
            <span className="text-sm font-medium">{notification.title}</span>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {notification.createdAt}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleMarkAsRead}
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationDropdown: React.FC = () => {
  const { state, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleNotificationClick = (questionId?: string) => {
    if (questionId) {
      navigate(`/question/${questionId}`);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {state.unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {state.unreadCount > 9 ? '9+' : state.unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-hidden p-0"
        sideOffset={4}
      >
        <div className="p-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {state.unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {state.notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
          {state.unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {state.unreadCount} unread notification{state.unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {state.notifications.length > 0 ? (
            state.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onNavigate={handleNotificationClick}
              />
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">
                You'll be notified when someone answers your questions or mentions you
              </p>
            </div>
          )}
        </div>

        {state.notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to a full notifications page
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
