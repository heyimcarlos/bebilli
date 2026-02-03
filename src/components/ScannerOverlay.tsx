import React, { useState } from 'react';
import { X, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ContributionSuccess } from '@/components/animations';

interface ScannerOverlayProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onClose, onSuccess }) => {
  const { t } = useApp();
  const [scanning, setScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectedAmount, setDetectedAmount] = useState(0);

  const handleScan = () => {
    setScanning(true);
    
    // Simulate scanning
    setTimeout(() => {
      const amount = Math.floor(Math.random() * 900) + 100;
      setDetectedAmount(amount);
      setScanning(false);
      setShowSuccess(true);
    }, 3000);
  };

  const handleSuccessComplete = () => {
    onSuccess(detectedAmount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4">
        <motion.h2 
          className="text-lg font-semibold"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {t('scanReceipt')}
        </motion.h2>
        <motion.button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="relative w-full max-w-xs aspect-[3/4] rounded-3xl border-2 border-primary/50 overflow-hidden bg-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {/* Scanner frame corners with animation */}
          {[
            { pos: 'top-0 left-0', border: 'border-t-4 border-l-4', rounded: 'rounded-tl-3xl' },
            { pos: 'top-0 right-0', border: 'border-t-4 border-r-4', rounded: 'rounded-tr-3xl' },
            { pos: 'bottom-0 left-0', border: 'border-b-4 border-l-4', rounded: 'rounded-bl-3xl' },
            { pos: 'bottom-0 right-0', border: 'border-b-4 border-r-4', rounded: 'rounded-br-3xl' },
          ].map((corner, i) => (
            <motion.div
              key={i}
              className={`absolute ${corner.pos} w-12 h-12 ${corner.border} border-primary ${corner.rounded}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            />
          ))}
          
          {/* Scanning animation */}
          <AnimatePresence>
            {scanning && (
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ top: 0, opacity: 0 }}
                animate={{ 
                  top: ['0%', '100%', '0%'],
                  opacity: [0, 1, 1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 blur-md bg-primary" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Placeholder content */}
          <AnimatePresence>
            {!scanning && !showSuccess && (
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Scan className="w-16 h-16 mb-4" />
                </motion.div>
                <p className="text-sm">Position the receipt</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {!showSuccess && (
          <motion.div 
            className="p-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <motion.div
              whileHover={!scanning ? { scale: 1.02 } : undefined}
              whileTap={!scanning ? { scale: 0.98 } : undefined}
            >
              <Button
                onClick={handleScan}
                disabled={scanning}
                className="w-full h-14 btn-primary text-primary-foreground font-semibold text-lg rounded-2xl"
              >
                {scanning ? (
                  <span className="flex items-center gap-2">
                    <motion.div 
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Scanning...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    {t('scanReceipt')}
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success celebration */}
      <ContributionSuccess
        isVisible={showSuccess}
        amount={detectedAmount}
        onComplete={handleSuccessComplete}
      />
    </motion.div>
  );
};

export default ScannerOverlay;
