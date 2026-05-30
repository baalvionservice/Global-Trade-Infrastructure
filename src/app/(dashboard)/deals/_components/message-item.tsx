
'use client';

import { Message } from '@/services/deal-service';
import { OfferCard } from './offer-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isMe: boolean;
  onOfferAction: (messageId: string, action: 'accept' | 'reject') => void;
}

export function MessageItem({ message, isMe, onOfferAction }: MessageItemProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-6">
        <span className="px-4 py-1.5 bg-muted/80 text-[10px] font-black uppercase tracking-wide text-muted-foreground rounded-full border border-border shadow-sm">
          {message.content.replace(/_/g, ' ')}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3 mb-6", isMe ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-9 w-9 mt-1 border shadow-sm shrink-0">
        <AvatarFallback className={cn(
          "font-black text-xs",
          isMe ? "bg-primary text-white" : "bg-muted text-muted-foreground"
        )}>
          {message.sender.substring(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isMe ? "items-end" : "items-start")}>
        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {isMe ? 'Authenticated Identity' : message.sender}
          </span>
          <span className="text-[10px] text-muted-foreground opacity-40 font-medium">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
        </div>

        {message.type === 'offer' && message.offerData ? (
          <OfferCard 
            offer={message.offerData} 
            isMe={isMe} 
            onAction={(action) => onOfferAction(message.id, action)} 
          />
        ) : (
          <div className={cn(
            "p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed",
            isMe 
              ? "bg-primary text-primary-foreground rounded-tr-none border-primary" 
              : "bg-white border-2 rounded-tl-none"
          )}>
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
