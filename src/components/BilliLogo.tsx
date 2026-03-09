import React from 'react';
import billiLogo from '@/assets/billi-logo-3d.png';

interface BilliLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showSlogan?: boolean;
  variant?: 'default' | 'white';
}

const BilliLogo: React.FC<BilliLogoProps> = ({ className = '', size = 48, showText = false, showSlogan = false, variant = 'default' }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-foreground';
  const sloganColor = variant === 'white' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img
        src={billiLogo}
        alt="Billi"
        width={size}
        height={size}
        className="object-contain drop-shadow-md"
        style={{
          width: size,
          height: size,
        }}
      />
      {showText && (
        <div className="flex flex-col ml-1">
          <span className={`font-black ${textColor} leading-tight tracking-tight`} style={{ fontSize: size * 0.55 }}>
            Billi
          </span>
          {showSlogan && (
            <span className={`${sloganColor} font-medium italic`} style={{ fontSize: size * 0.2 }}>
              Build your billion.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BilliLogo;
