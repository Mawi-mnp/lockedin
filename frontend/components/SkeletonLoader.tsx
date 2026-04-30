'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'title' | 'card' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

export default function SkeletonLoader({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-white/5 rounded-lg overflow-hidden relative';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-2/3',
    card: 'h-32 w-full rounded-2xl',
    circle: 'rounded-full w-12 h-12',
    rect: 'h-24 w-full',
  };

  const variantClasses = variants[variant];

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses} ${width ? `w-[${width}]` : ''} ${height ? `h-[${height}]` : ''} ${className}`}
      animate={{
        background: [
          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
          'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 100%)',
          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

// Pre-built skeleton layouts
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <SkeletonLoader variant="circle" className="w-12 h-12" />
      <SkeletonLoader variant="title" />
      <SkeletonLoader variant="text" />
      <SkeletonLoader variant="text" className="w-3/4" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center space-y-3">
          <SkeletonLoader variant="title" className="mx-auto w-16 h-12" />
          <SkeletonLoader variant="text" className="w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonLoader variant="circle" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" className="w-1/2" />
            <SkeletonLoader variant="text" className="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
