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
        console.error('[OAuth] Error from provider:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // Check if we have OAuth params (code or tokens)
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      console.log('[OAuth] Callback received - code:', !!code, 'state:', !!state);
      
      if (code) {
        try {
          // Use lovable.auth to complete the OAuth flow
          // The library will detect the code in the URL and exchange it for tokens
          // Then it automatically calls supabase.auth.setSession with those tokens
          const result = await lovable.auth.signInWithOAuth('google', {
            redirect_uri: window.location.origin + '/callback',
          });

          console.log('[OAuth] signInWithOAuth result:', { 
            redirected: (result as any).redirected,
            error: result.error?.message 
          });

          if (result.error) {
            console.error('[OAuth] Exchange error:', result.error);
            setError(result.error.message || 'Authentication failed');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
          }

          // If we got redirected, something went wrong (shouldn't happen on callback)
          if ((result as any).redirected) {
            console.log('[OAuth] Unexpected redirect on callback');
            return;
          }

          // Success - session should be set, navigate to home
          console.log('[OAuth] Success! Navigating to home');
          navigate('/', { replace: true });
          
        } catch (err) {
          console.error('[OAuth] Callback processing error:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } else {
        // No code - shouldn't happen, redirect to login
        console.log('[OAuth] No code found, redirecting to login');
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
