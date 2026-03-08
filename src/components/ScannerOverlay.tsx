import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Loader2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useGroups } from '@/hooks/useGroups';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContributionSuccess } from '@/components/animations';
import { useToast } from '@/hooks/use-toast';
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

interface ScanResult {
  amount: number;
  currency: string | null;
  date: string | null;
  transaction_type: string | null;
  description: string;
  confidence: number;
  validation_status: string;
  amount_match: boolean | null;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onClose, onSuccess }) => {
  const { t, formatCurrency } = useApp();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { groups } = useGroups(user?.id);
  const [mode, setMode] = useState<'camera' | 'upload' | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [manualAmount, setManualAmount] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

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
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
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
    
    try {
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { 
          imageBase64: imageData,
          groupId: selectedGroupId || undefined,
        },
      });

      if (error) {
        console.error('Scan error:', error);
        toast({ title: t('error'), description: 'Failed to process receipt', variant: 'destructive' });
        setScanning(false);
        return;
      }

      const result: ScanResult = {
        amount: Number(data?.amount) || 0,
        currency: data?.currency || null,
        date: data?.date || null,
        transaction_type: data?.transaction_type || null,
        description: data?.description || '',
        confidence: Number(data?.confidence) || 0,
        validation_status: data?.validation_status || 'pending',
        amount_match: data?.amount_match ?? null,
      };
      
      setScanResult(result);
      setManualAmount(result.amount > 0 ? result.amount.toString() : '');
    } catch (err) {
      console.error('Processing error:', err);
      toast({ title: t('error'), description: 'Error processing image', variant: 'destructive' });
    }
    
    setScanning(false);
  };

  const handleConfirm = async () => {
    const finalAmount = manualAmount ? parseFloat(manualAmount) : (scanResult?.amount || 0);
    if (finalAmount <= 0) return;

    // Validate the declared amount against extracted amount
    if (scanResult && scanResult.amount > 0) {
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: {
          imageBase64: imagePreview,
          declaredAmount: finalAmount,
          groupId: selectedGroupId || undefined,
        },
      });

      if (!error && data) {
        const status = data.validation_status;
        const match = data.amount_match;

        if (status === 'flagged' && match === false) {
          toast({
            title: '⚠️ ' + (t('amountMismatch') || 'Amount mismatch detected'),
            description: `${t('extractedAmount') || 'Extracted'}: ${formatCurrency(data.amount || scanResult.amount)} vs ${t('declared') || 'Declared'}: ${formatCurrency(finalAmount)}. ${t('flaggedForReview') || 'Flagged for group review.'}`,
            variant: 'destructive',
          });
        } else if (status === 'approved') {
          toast({
            title: '✅ ' + (t('receiptVerified') || 'Receipt verified'),
            description: t('amountMatches') || 'Amount matches receipt. Auto-approved!',
          });
        }
      }
    }

    setShowSuccess(true);
  };

  const handleSuccessComplete = () => {
    const finalAmount = manualAmount ? parseFloat(manualAmount) : (scanResult?.amount || 0);
    onSuccess(finalAmount, selectedGroupId);
  };

  const resetScanner = () => {
    setMode(null);
    setImagePreview(null);
    setScanResult(null);
    setManualAmount('');
    setScanning(false);
  };

  const getValidationBadge = () => {
    if (!scanResult || scanResult.amount === 0) return null;
    
    const confidence = scanResult.confidence;
    if (confidence >= 80) {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('highConfidence') || 'High confidence'}
        </div>
      );
    } else if (confidence >= 50) {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          {t('mediumConfidence') || 'Medium confidence'}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full">
        <AlertTriangle className="w-3.5 h-3.5" />
        {t('lowConfidence') || 'Low confidence'}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col pt-safe"
    >
      <div className="flex items-center justify-between p-4 pt-12 border-b border-border">
        <motion.h2 className="text-lg font-semibold" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          {t('scanReceipt')}
        </motion.h2>
        <motion.button
          onClick={() => { stopCamera(); onClose(); }}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

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
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {!mode && !imagePreview && (
            <motion.div key="mode-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm space-y-4">
              <Button onClick={startCamera} className="w-full h-20 btn-primary text-primary-foreground flex flex-col gap-1">
                <Camera className="w-8 h-8" />
                <span>{t('useCamera') || 'Use Camera'}</span>
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-20 flex flex-col gap-1">
                <Upload className="w-8 h-8" />
                <span>{t('uploadFile') || 'Upload File'}</span>
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </motion.div>
          )}

          {mode === 'camera' && !imagePreview && (
            <motion.div key="camera" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-primary/50 rounded-xl pointer-events-none">
                  {['top-0 left-0 border-t-4 border-l-4 rounded-tl-xl','top-0 right-0 border-t-4 border-r-4 rounded-tr-xl','bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl','bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl'].map((corner, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-primary ${corner}`} />
                  ))}
                </div>
              </div>
              <Button onClick={capturePhoto} className="w-full mt-4 h-14 btn-primary text-primary-foreground">
                <Camera className="w-5 h-5 mr-2" />{t('capture') || 'Capture'}
              </Button>
              <Button onClick={() => { stopCamera(); setMode(null); }} variant="ghost" className="w-full mt-2">
                {t('cancel') || 'Cancel'}
              </Button>
            </motion.div>
          )}

          {imagePreview && (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Receipt" className="w-full h-full object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-white font-medium">{t('analyzing') || 'Analyzing receipt...'}</p>
                  </div>
                )}
              </div>

              {!scanning && scanResult && scanResult.amount > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-sm text-muted-foreground">{t('detectedAmount') || 'Detected Amount'}</p>
                      {getValidationBadge()}
                    </div>
                    <p className="text-3xl font-bold gradient-text">{formatCurrency(scanResult.amount)}</p>
                    {scanResult.description && (
                      <p className="text-xs text-muted-foreground mt-1">{scanResult.description}</p>
                    )}
                  </div>

                  {/* Extracted details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {scanResult.date && (
                      <div className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-muted-foreground">{t('date') || 'Date'}</p>
                        <p className="font-medium">{scanResult.date}</p>
                      </div>
                    )}
                    {scanResult.transaction_type && (
                      <div className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-muted-foreground">{t('type') || 'Type'}</p>
                        <p className="font-medium capitalize">{scanResult.transaction_type}</p>
                      </div>
                    )}
                    {scanResult.currency && (
                      <div className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-muted-foreground">{t('currency') || 'Currency'}</p>
                        <p className="font-medium">{scanResult.currency}</p>
                      </div>
                    )}
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="text-muted-foreground">{t('confidence') || 'Confidence'}</p>
                      <p className="font-medium">{scanResult.confidence}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('adjustAmount') || 'Adjust amount if needed'}</Label>
                    <Input type="number" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="text-center text-lg font-semibold" min="0" step="0.01" />
                  </div>
                  <Button onClick={handleConfirm} disabled={!selectedGroupId} className="w-full h-14 btn-primary text-primary-foreground">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {t('confirmContribution')}
                  </Button>
                  <Button onClick={resetScanner} variant="ghost" className="w-full">{t('scanAgain') || 'Scan Again'}</Button>
                </motion.div>
              )}

              {!scanning && (!scanResult || scanResult.amount === 0) && imagePreview && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">{scanResult?.description || 'Could not detect amount'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('enterAmount') || 'Enter amount manually'}</Label>
                    <Input type="number" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="text-center text-lg font-semibold" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <Button onClick={handleConfirm} disabled={!selectedGroupId || !manualAmount} className="w-full h-14 btn-primary text-primary-foreground">
                    {t('confirmContribution')}
                  </Button>
                  <Button onClick={resetScanner} variant="ghost" className="w-full">{t('scanAgain') || 'Scan Again'}</Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <ContributionSuccess
        isVisible={showSuccess}
        amount={manualAmount ? parseFloat(manualAmount) : (scanResult?.amount || 0)}
        onComplete={handleSuccessComplete}
      />
    </motion.div>
  );
};

export default ScannerOverlay;
