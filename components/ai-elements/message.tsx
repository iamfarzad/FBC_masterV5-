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
      'flex flex-col gap-2 rounded-2xl text-sm px-4 py-3 overflow-hidden transition-all duration-200',
      // Clean, neutral styling
      'group-[.is-user]:bg-muted group-[.is-user]:text-muted-foreground group-[.is-user]:rounded-br-md',
      'group-[.is-assistant]:bg-background group-[.is-assistant]:border group-[.is-assistant]:border-border group-[.is-assistant]:text-foreground group-[.is-assistant]:rounded-bl-md',
      // Subtle hover effects
      'group-[.is-user]:hover:bg-muted/80 group-[.is-assistant]:hover:shadow-sm',
      className,
    )}
    {...props}
  >
    <div className="break-words leading-relaxed">{children}</div>
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
    <AvatarImage alt="" className="my-0" src={src} />
    <AvatarFallback className="bg-muted font-medium text-muted-foreground">
      {name?.slice(0, 2) || 'ME'}
    </AvatarFallback>
  </Avatar>
);
