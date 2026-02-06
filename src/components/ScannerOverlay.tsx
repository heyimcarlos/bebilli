import React, { useState, useRef, useEffect } from 'react';
import { X, Scan, Camera, Upload, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useGroups, GroupWithDetails } from '@/hooks/useGroups';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContributionSuccess } from '@/components/animations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScannerOverlayProps {
  onClose: () => void;
  onSuccess: (amount: number, groupId?: string) => void;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onClose, onSuccess }) => {
  const { t, formatCurrency } = useApp();
  const { user } = useAuthContext();
  const { groups } = useGroups(user?.id);
  const [mode, setMode] = useState<'camera' | 'upload' | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectedAmount, setDetectedAmount] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [manualAmount, setManualAmount] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Set default group
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera access denied:', error);
      // Fallback to file upload
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setImagePreview(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImagePreview(imageData);
        setMode('upload');
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setScanning(true);
    
    // Simulate OCR processing with Lovable AI
    // In production, this would call an edge function with the Lovable AI gateway
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulated detection (in production, this would be real OCR)
    const amount = Math.floor(Math.random() * 900) + 100;
    setDetectedAmount(amount);
    setManualAmount(amount.toString());
    setScanning(false);
  };

  const handleConfirm = () => {
    const finalAmount = manualAmount ? parseFloat(manualAmount) : detectedAmount;
    if (finalAmount > 0) {
      setShowSuccess(true);
    }
  };

  const handleSuccessComplete = () => {
    const finalAmount = manualAmount ? parseFloat(manualAmount) : detectedAmount;
    onSuccess(finalAmount, selectedGroupId);
  };

  const resetScanner = () => {
    setMode(null);
    setImagePreview(null);
    setDetectedAmount(0);
    setManualAmount('');
    setScanning(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col pt-safe"
    >
      {/* Header - with safe area padding for mobile */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-border">
        <motion.h2 
          className="text-lg font-semibold"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {t('scanReceipt')}
        </motion.h2>
        <motion.button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Group Selection */}
      <div className="p-4 border-b border-border">
        <Label className="mb-2 block text-sm text-muted-foreground">
          {t('selectGroup') || 'Select Group'}
        </Label>
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="bg-secondary">
            <SelectValue placeholder={t('selectGroup') || 'Select a group'} />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                <div className="flex items-center gap-2">
                  {group.image_url && (
                    <img src={group.image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                  )}
                  <span>{group.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {/* Initial mode selection */}
          {!mode && !imagePreview && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-4"
            >
              <Button
                onClick={startCamera}
                className="w-full h-20 btn-primary text-primary-foreground flex flex-col gap-1"
              >
                <Camera className="w-8 h-8" />
                <span>{t('useCamera') || 'Use Camera'}</span>
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-20 flex flex-col gap-1"
              >
                <Upload className="w-8 h-8" />
                <span>{t('uploadFile') || 'Upload File'}</span>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.div>
          )}

          {/* Camera View */}
          {mode === 'camera' && !imagePreview && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Scanner frame */}
                <div className="absolute inset-4 border-2 border-primary/50 rounded-xl pointer-events-none">
                  {[
                    'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                    'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                    'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                    'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                  ].map((corner, i) => (
                    <div
                      key={i}
                      className={`absolute w-8 h-8 border-primary ${corner}`}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={capturePhoto}
                className="w-full mt-4 h-14 btn-primary text-primary-foreground"
              >
                <Camera className="w-5 h-5 mr-2" />
                {t('capture') || 'Capture'}
              </Button>
              <Button
                onClick={() => {
                  stopCamera();
                  setMode(null);
                }}
                variant="ghost"
                className="w-full mt-2"
              >
                {t('cancel') || 'Cancel'}
              </Button>
            </motion.div>
          )}

          {/* Image Preview & Processing */}
          {imagePreview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm space-y-4"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Receipt"
                  className="w-full h-full object-cover"
                />
                {scanning && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-white font-medium">{t('analyzing') || 'Analyzing receipt...'}</p>
                  </div>
                )}
              </div>

              {!scanning && detectedAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 space-y-4"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t('detectedAmount') || 'Detected Amount'}
                    </p>
                    <p className="text-3xl font-bold gradient-text">
                      {formatCurrency(detectedAmount)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('adjustAmount') || 'Adjust amount if needed'}</Label>
                    <Input
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="text-center text-lg font-semibold"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedGroupId}
                    className="w-full h-14 btn-primary text-primary-foreground"
                  >
                    {t('confirmContribution')}
                  </Button>
                  
                  <Button
                    onClick={resetScanner}
                    variant="ghost"
                    className="w-full"
                  >
                    {t('scanAgain') || 'Scan Again'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Success celebration */}
      <ContributionSuccess
        isVisible={showSuccess}
        amount={manualAmount ? parseFloat(manualAmount) : detectedAmount}
        onComplete={handleSuccessComplete}
      />
    </motion.div>
  );
};

export default ScannerOverlay;
