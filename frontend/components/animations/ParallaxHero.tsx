'use client';

import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxHeroProps {
  children: ReactNode;
  className?: string;
}

export default function ParallaxHero({ children, className = '' }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const yBackground = useTransform(scrollY, [0, 500], [0, 150]);
  const yContent = useTransform(scrollY, [0, 500], [0, -50]);
  const opacityContent = useTransform(scrollY, [0, 300], [1, 0.7]);
  const scaleOrb = useTransform(scrollY, [0, 500], [1, 1.2]);
  const rotateOrb = useTransform(scrollY, [0, 500], [0, 15]);

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ y: yBackground }}
    >
      {/* Animated gradient orb */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          scale: scaleOrb,
          rotate: rotateOrb,
        }}
      >
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(83,58,253,0.25)_0%,rgba(168,85,247,0.15)_40%,transparent_70%)] blur-[80px] animate-pulse" />
      </motion.div>

      {/* Secondary orb */}
      <motion.div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          x: useTransform(scrollY, [0, 500], [0, -100]),
          y: useTransform(scrollY, [0, 500], [0, 50]),
        }}
      >
        <div className="w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] blur-[60px]" />
      </motion.div>

      {/* Content with parallax */}
      <motion.div style={{ y: yContent, opacity: opacityContent }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
