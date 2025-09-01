import { cn } from '@/src/core/utils';
import type { Experimental_GeneratedImage } from 'ai';

export type ImageProps = (Experimental_GeneratedImage | {
  src: string;
  alt?: string;
}) & {
  className?: string;
};

export const Image = (props: ImageProps) => {
  // Check if it's a regular image with src
  if ('src' in props) {
    return (
      <img
        src={props.src}
        alt={props.alt || 'Image'}
        className={cn(
          'max-w-full h-auto rounded-md overflow-hidden border border-border/20',
          props.className,
        )}
      />
    );
  }

  // AI-generated image with base64
  const { base64, uint8Array, mediaType, ...restProps } = props;
  return (
    <img
      {...restProps}
      src={`data:${mediaType};base64,${base64}`}
      alt={props.alt || 'Generated image'}
      className={cn(
        'max-w-full h-auto rounded-md overflow-hidden border border-border/20',
        props.className,
      )}
    />
  );
};
