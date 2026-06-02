'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, MessageSquare, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getNotifications, markNotificationAsRead, Notification } from '@/services/communication-service';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const icons = {
  message: MessageSquare,
  deal: CheckCircle2,
  order: Package,
  system: AlertTriangle,
};

const colors = {
  message: 'text-blue-500 bg-blue-50',
  deal: 'text-green-500 bg-green-50',
  order: 'text-purple-500 bg-purple-50',
  system: 'text-orange-500 bg-orange-50',
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    // Defensive: never let an unexpected payload shape crash the global header.
    getNotifications()
      .then((n) => setNotifications(Array.isArray(n) ? n : []))
      .catch(() => setNotifications([]));
  }, []);

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground border-2 border-background">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && <span className="text-[10px] text-muted-foreground font-normal">{unreadCount} unread</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = (icons as any)[n.type];
              return (
                <DropdownMenuItem 
                  key={n.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 focus:bg-muted cursor-pointer",
                    !n.isRead && "bg-muted/30"
                  )}
                  onClick={() => handleRead(n.id)}
                >
                  <div className={cn("p-2 rounded-full shrink-0", (colors as any)[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className={cn("text-xs font-semibold leading-none truncate", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {n.description}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-medium pt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-xs text-primary font-medium focus:text-primary">
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
