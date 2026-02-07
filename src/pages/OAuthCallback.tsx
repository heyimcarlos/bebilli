import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { lovable } from '@/integrations/lovable';

/**
 * OAuth callback handler page
 * Handles the redirect from OAuth providers using Lovable Cloud auth
 */
const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      
      // Check for OAuth errors first
      const errorParam = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (errorParam) {
        setError(errorDescription || errorParam);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // Check if we have OAuth code
      const code = url.searchParams.get('code');
      
      if (code) {
        try {
          // Let Lovable Cloud library handle the token exchange automatically
          // Don't pass redirect_uri - let the library use its defaults
          const result = await lovable.auth.signInWithOAuth('google');

          if (result.error) {
            setError(result.error.message || 'Authentication failed');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
          }

          // If we got redirected, something went wrong (shouldn't happen on callback)
          if ((result as any).redirected) {
            return;
          }

          // Success - session should be set, navigate to home
          navigate('/', { replace: true });
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } else {
        // No code - redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Erro de Autenticação</h2>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
