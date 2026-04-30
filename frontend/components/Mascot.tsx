import Image from 'next/image';

interface MascotProps {
  expression?: 'hero' | 'avatar' | 'celebrating' | 'working' | 'nudge' | 'victory';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Mascot({ 
  expression = 'hero', 
  size = 'md', 
  className = '' 
}: MascotProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const expressionMap = {
    hero: 'commit-hero.svg',
    avatar: 'commit-avatar.svg',
    celebrating: 'commit-celebrating.svg',
    working: 'commit-working.svg',
    nudge: 'commit-nudge.svg',
    victory: 'commit-victory.svg',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Image
        src={`/mascots/${expressionMap[expression]}`}
        alt="Commit the Honey Badger"
        width={size === 'sm' ? 48 : size === 'md' ? 96 : size === 'lg' ? 128 : 192}
        height={size === 'sm' ? 48 : size === 'md' ? 96 : size === 'lg' ? 128 : 192}
        priority
      />
    </div>
  );
}
