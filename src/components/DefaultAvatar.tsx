import React from 'react';

interface DefaultAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

// Generate a deterministic avatar variation based on name
const getAvatarStyle = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variant = hash % 6;
  
  // Hair styles and colors
  const hairStyles = [
    { hair: 'short-spiky', color: '#3D2B1F' },
    { hair: 'long-straight', color: '#8B4513' },
    { hair: 'curly', color: '#2C1608' },
    { hair: 'bob', color: '#D4A574' },
    { hair: 'mohawk', color: '#1A1A1A' },
    { hair: 'ponytail', color: '#654321' },
  ];

  const skinTones = ['#FDDCB5', '#E8B896', '#D4956B', '#C68642', '#8D5524', '#F5D0A9'];
  
  return {
    ...hairStyles[variant],
    skin: skinTones[hash % skinTones.length],
    hasGlasses: hash % 3 === 0,
    gender: hash % 2 === 0 ? 'M' : 'F',
  };
};

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ name, size = 40, className = '' }) => {
  const style = getAvatarStyle(name);
  const initial = name.charAt(0).toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange circle background (matching brand) */}
      <circle cx="40" cy="40" r="38" fill="hsl(30, 100%, 50%)" stroke="hsl(30, 100%, 45%)" strokeWidth="2" />
      
      {/* Inner lighter circle */}
      <circle cx="40" cy="40" r="34" fill="#FFF5EB" />
      
      {/* Face/skin */}
      <circle cx="40" cy="38" r="18" fill={style.skin} />
      
      {/* Eyes */}
      <ellipse cx="34" cy="36" rx="2.5" ry="3" fill="#1A1A1A" />
      <ellipse cx="46" cy="36" rx="2.5" ry="3" fill="#1A1A1A" />
      
      {/* Eye highlights */}
      <circle cx="35" cy="35" r="1" fill="white" />
      <circle cx="47" cy="35" r="1" fill="white" />
      
      {/* Smile */}
      <path d="M34 43 Q40 48 46 43" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Nose */}
      <path d="M40 38 L39 41 L41 41" fill="none" stroke={style.skin === '#FDDCB5' ? '#D4956B' : '#8D5524'} strokeWidth="1" strokeLinecap="round" />
      
      {/* Hair - varies by style */}
      {style.hair === 'short-spiky' && (
        <path d="M22 32 C22 18 32 14 40 14 C48 14 58 18 58 32 L56 28 L52 26 L48 28 L44 24 L40 26 L36 24 L32 28 L28 26 L24 28 Z" fill={style.color} />
      )}
      {style.hair === 'long-straight' && (
        <>
          <path d="M22 34 C22 18 30 12 40 12 C50 12 58 18 58 34 L58 48 C58 48 54 40 54 34 L26 34 C26 40 22 48 22 48 Z" fill={style.color} />
        </>
      )}
      {style.hair === 'curly' && (
        <>
          <circle cx="28" cy="24" r="6" fill={style.color} />
          <circle cx="40" cy="20" r="7" fill={style.color} />
          <circle cx="52" cy="24" r="6" fill={style.color} />
          <circle cx="34" cy="18" r="5" fill={style.color} />
          <circle cx="46" cy="18" r="5" fill={style.color} />
        </>
      )}
      {style.hair === 'bob' && (
        <path d="M20 34 C20 16 30 12 40 12 C50 12 60 16 60 34 C60 42 56 44 54 44 L54 30 L26 30 L26 44 C24 44 20 42 20 34 Z" fill={style.color} />
      )}
      {style.hair === 'mohawk' && (
        <path d="M36 14 C36 10 38 8 40 8 C42 8 44 10 44 14 L44 26 L36 26 Z" fill={style.color} />
      )}
      {style.hair === 'ponytail' && (
        <>
          <path d="M22 32 C22 18 30 12 40 12 C50 12 58 18 58 32 L54 28 L26 28 Z" fill={style.color} />
          <path d="M54 24 C58 24 62 28 62 36 C62 42 60 48 58 50" stroke={style.color} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
      
      {/* Glasses (optional) */}
      {style.hasGlasses && (
        <>
          <circle cx="34" cy="36" r="5" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="46" cy="36" r="5" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M39 36 L41 36" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M29 35 L24 33" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M51 35 L56 33" stroke="#1A1A1A" strokeWidth="1.5" />
        </>
      )}
      
      {/* Cheeks */}
      <circle cx="28" cy="42" r="3" fill="#FFB5B5" opacity="0.4" />
      <circle cx="52" cy="42" r="3" fill="#FFB5B5" opacity="0.4" />
      
      {/* Body hint at bottom */}
      <path d="M24 58 C24 52 32 50 40 50 C48 50 56 52 56 58 L56 66 C56 68 54 70 52 70 L28 70 C26 70 24 68 24 66 Z" fill="hsl(30, 100%, 50%)" />
    </svg>
  );
};

export default DefaultAvatar;
