'use client';

import { ReactNode, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import Link from 'next/link';

interface HoverButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function HoverButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
}: HoverButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  const background = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent)`;

  const baseClasses = `inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 relative overflow-hidden`;
  
  const variants = {
    primary: `text-white bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30`,
    secondary: `text-white bg-white/5 border border-white/5 hover:bg-white/10`,
  };

  const content = (
    <>
      <motion.span
        className="absolute inset-0"
        style={{ background }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="relative z-10"
        animate={{
          x: isHovered ? 2 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </>
  );

  if (href) {
    return (
      <Link
        ref={ref as any}
        href={href}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref as any}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
    >
      {content}
    </motion.button>
  );
}
