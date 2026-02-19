import React from 'react';
import billiLogo from '@/assets/billi-logo.png';

interface BilliLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'default' | 'white';
}

const BilliLogo: React.FC<BilliLogoProps> = ({ className = '', size = 48, showText = false, variant = 'default' }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-foreground';
  const subColor = variant === 'white' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img
        src={billiLogo}
        alt="Billi"
        width={size}
        height={size}
        className="object-contain"
        style={{
          width: size,
          height: size,
          ...(variant === 'white'
            ? { mixBlendMode: 'screen' as const }
            : {}),
        }}
      />

      {showText && (
        <div className="flex flex-col ml-1">
          <span className={`font-black ${textColor} leading-tight tracking-tight`} style={{ fontSize: size * 0.55 }}>
            Billi
          </span>
          <span className={`font-medium ${subColor}`} style={{ fontSize: size * 0.22, marginTop: -2 }}>
            bilionaire
          </span>
        </div>
      )}
    </div>
  );
};

export default BilliLogo;
