'use client';

import { motion } from 'framer-motion';

interface MascotProps {
  expression?: 'hero' | 'celebrating' | 'working' | 'determined';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export default function Mascot({ 
  expression = 'hero', 
  size = 'md', 
  className = '',
  animated = true
}: MascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  // Honey badger mascot - determined, fearless, never gives up
  // Perfect for commitment/accountability theme
  const renderMascot = () => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#533afd" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="stripeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Body - stout, determined stance */}
      <ellipse cx="60" cy="70" rx="38" ry="32" fill="#1a1a2e" stroke="url(#bodyGradient)" strokeWidth="2.5" filter="url(#glow)"/>
      
      {/* White stripe across back (honey badger signature) */}
      <path d="M30 65 Q60 55 90 65 L90 75 Q60 65 30 75 Z" fill="url(#stripeGradient)" opacity="0.9"/>
      
      {/* Head - determined expression */}
      <circle cx="60" cy="42" r="28" fill="#1a1a2e" stroke="url(#bodyGradient)" strokeWidth="2.5" filter="url(#glow)"/>
      
      {/* Eyes - focused, determined */}
      <ellipse cx="50" cy="40" rx="6" ry="7" fill="#ffffff"/>
      <ellipse cx="70" cy="40" rx="6" ry="7" fill="#ffffff"/>
      <circle cx="52" cy="40" r="3.5" fill="#0a0a0a"/>
      <circle cx="72" cy="40" r="3.5" fill="#0a0a0a"/>
      
      {/* Eyebrows - determined/focused */}
      <path d="M44 32 L56 35" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M76 32 L64 35" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/>
      
      {/* Nose */}
      <ellipse cx="60" cy="50" rx="5" ry="4" fill="#0a0a0a"/>
      <ellipse cx="58" cy="49" rx="2" ry="1.5" fill="#ffffff" opacity="0.6"/>
      
      {/* Mouth - determined line */}
      <path d="M54 58 Q60 61 66 58" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Ears */}
      <circle cx="35" cy="28" r="7" fill="#1a1a2e" stroke="url(#bodyGradient)" strokeWidth="2"/>
      <circle cx="85" cy="28" r="7" fill="#1a1a2e" stroke="url(#bodyGradient)" strokeWidth="2"/>
      <circle cx="35" cy="28" r="3" fill="#a855f7" opacity="0.6"/>
      <circle cx="85" cy="28" r="3" fill="#a855f7" opacity="0.6"/>
      
      {/* Arms - strong, capable */}
      <path d="M35 68 Q20 78 25 88" stroke="#1a1a2e" strokeWidth="10" strokeLinecap="round"/>
      <path d="M85 68 Q100 78 95 88" stroke="#1a1a2e" strokeWidth="10" strokeLinecap="round"/>
      
      {/* Claws */}
      <path d="M22 88 L20 94 M25 88 L25 94 M28 88 L30 94" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round"/>
      <path d="M92 88 L90 94 M95 88 L95 94 M98 88 L100 94" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Star/badge on chest - commitment symbol */}
      <polygon points="60,55 62,62 70,62 64,67 66,74 60,70 54,74 56,67 50,62 58,62" fill="url(#bodyGradient)" filter="url(#glow)"/>
    </svg>
  );

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${className}`}
      animate={animated ? {
        y: [0, -8, 0],
        rotate: [0, 2, 0, -2, 0],
      } : undefined}
      transition={animated ? {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      } : undefined}
    >
      {renderMascot()}
    </motion.div>
  );
}
