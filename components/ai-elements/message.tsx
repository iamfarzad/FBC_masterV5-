import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import type { ComponentProps, HTMLAttributes } from 'react';
import { cn } from '@/src/core/utils';
import type { UIMessage } from 'ai';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-start gap-4 py-4',
      from === 'user' ? 'is-user flex-row-reverse' : 'is-assistant',
      '[&>div]:max-w-[85%]',
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      'flex flex-col gap-2 rounded-2xl text-sm text-foreground px-4 py-3 overflow-hidden shadow-lg backdrop-blur-xl transition-all duration-200',
      // Modern styling with glass morphism
      'group-[.is-user]:bg-gradient-to-r group-[.is-user]:from-accent group-[.is-user]:to-accent/90 group-[.is-user]:text-accent-foreground group-[.is-user]:rounded-br-md',
      'group-[.is-assistant]:bg-card/60 group-[.is-assistant]:border group-[.is-assistant]:border-border/20 group-[.is-assistant]:text-foreground group-[.is-assistant]:rounded-bl-md',
      // Enhanced hover effects
      'group-[.is-user]:hover:shadow-xl group-[.is-assistant]:hover:shadow-lg',
      className,
    )}
    {...props}
  >
    <div className="is-user:dark leading-relaxed break-words">{children}</div>
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar
    className={cn('size-8 ring ring-1 ring-border shadow-sm', className)}
    {...props}
  >
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback className="bg-muted text-muted-foreground font-medium">
      {name?.slice(0, 2) || 'ME'}
    </AvatarFallback>
  </Avatar>
);
