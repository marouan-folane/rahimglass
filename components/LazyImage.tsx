import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, priority, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Fail-safe: if image hasn't loaded in 3 seconds, show it anyway (it might be throttled)
    const timer = setTimeout(() => {
      if (!isLoaded) setIsLoaded(true);
    }, 3000);

    // Check if image is already cached
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <div className={`overflow-hidden bg-gray-100 relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 z-10" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)} // Show anyway on error to avoid empty box
        className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
          }`}
        {...props}
      />
    </div>
  );
};