import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pin, Lock, Trash2, Edit } from 'lucide-react';

interface AdminControlsProps {
  currentUser: any;
  itemType: 'question' | 'comment';
  item: any;
  onAction: (action: string, itemId: string) => void;
}

export const AdminControls: React.FC<AdminControlsProps> = ({
  currentUser,
  itemType,
  item,
  onAction
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (currentUser?.role !== 'admin') {
    return null;
  }

  const handleAction = (action: string) => {
    onAction(action, item.id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleAction('pin')}
          className="flex items-center space-x-2"
        >
          <Pin className="h-4 w-4" />
          <span>{item.isPinned ? 'Unpin' : 'Pin'} {itemType}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleAction('lock')}
          className="flex items-center space-x-2"
        >
          <Lock className="h-4 w-4" />
          <span>{item.isLocked ? 'Unlock' : 'Lock'} {itemType}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleAction('edit')}
          className="flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>Edit {itemType}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete {itemType}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};