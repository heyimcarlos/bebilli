import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const { t } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      return; // Already installed
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show banner after a delay
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show banner after delay
    if (isIOSDevice) {
      const hasSeenIOSPrompt = localStorage.getItem('billi-ios-prompt-seen');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      localStorage.setItem('billi-ios-prompt-seen', 'true');
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    if (isIOS) {
      localStorage.setItem('billi-ios-prompt-seen', 'true');
    }
  };

  if (!showInstallBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && !showIOSInstructions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">
                    {t('installApp')}
                  </h3>
                  <p className="text-white/80 text-xs mt-1">
                    {t('installDescription')}
                  </p>
                </div>
                <button 
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>
              <Button
                onClick={handleInstallClick}
                className="w-full mt-3 bg-white text-emerald-600 hover:bg-white/90 font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('installNow')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {t('installOnIOS')}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Share className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">1. {t('tapShare')}</p>
                    <p className="text-slate-400 text-xs">{t('tapShareDesc')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">2. {t('addToHomeScreen')}</p>
                    <p className="text-slate-400 text-xs">{t('addToHomeScreenDesc')}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600"
              >
                {t('understood')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPWA;
