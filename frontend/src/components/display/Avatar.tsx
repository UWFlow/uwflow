import React from 'react';

import { cn } from 'lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  size?: 'sm' | 'md';
}

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ alt, className, size = 'md', ...props }, ref) => (
    <img
      {...props}
      ref={ref}
      alt={alt}
      className={cn(
        'shrink-0 rounded-full bg-light3 object-cover',
        size === 'sm' ? 'h-7 w-7' : 'h-16 w-16',
        className,
      )}
    />
  ),
);
Avatar.displayName = 'Avatar';

export default Avatar;
