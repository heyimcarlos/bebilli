import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

const colors = ['#FF6B35', '#FFD700', '#00D4AA', '#FF4081', '#7C4DFF', '#00BCD4'];

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ 
  isActive, 
  onComplete,
  duration = 3000 
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                left: `${piece.x}%`,
                backgroundColor: piece.color,
                scale: piece.scale,
              }}
              initial={{ 
                y: -20, 
                opacity: 1,
                rotate: 0,
              }}
              animate={{ 
                y: '100vh',
                opacity: [1, 1, 0],
                rotate: piece.rotation + 720,
                x: [0, Math.sin(piece.id) * 100, Math.cos(piece.id) * 50],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5,
                delay: piece.delay,
                ease: [0.23, 0.03, 0.32, 1],
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
