import React, { useState, useEffect } from 'react';
import { X, Check, Scan } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

interface ScannerOverlayProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onClose, onSuccess }) => {
  const { t, formatCurrency } = useApp();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [detectedAmount, setDetectedAmount] = useState(0);

  const handleScan = () => {
    setScanning(true);
    
    // Simulate scanning
    setTimeout(() => {
      const amount = Math.floor(Math.random() * 900) + 100;
      setDetectedAmount(amount);
      setScanning(false);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess(amount);
      }, 2000);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">{t('scanReceipt')}</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-xs aspect-[3/4] rounded-3xl border-2 border-primary/50 overflow-hidden bg-card">
          {/* Scanner frame corners */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-3xl" />
          
          {/* Scanning animation */}
          {scanning && (
            <div className="scanner-line" />
          )}
          
          {/* Success state */}
          {success && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4 glow-success">
                <Check className="w-10 h-10 text-success" />
              </div>
              <p className="text-lg font-semibold text-center px-4">
                {t('aiDetected')}
              </p>
              <p className="text-2xl font-bold gradient-text mt-2">
                {formatCurrency(detectedAmount)}
              </p>
              <p className="text-sm text-success mt-2">{t('rankingUpdated')}</p>
            </div>
          )}
          
          {/* Placeholder content */}
          {!scanning && !success && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Scan className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm">Posicione o comprovante</p>
            </div>
          )}
        </div>
      </div>
      
      {!success && (
        <div className="p-6">
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="w-full h-14 btn-primary text-primary-foreground font-semibold text-lg rounded-2xl"
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Escaneando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                {t('scanReceipt')}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScannerOverlay;
