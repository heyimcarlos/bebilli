import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { lovable } from '@/integrations/lovable';

/**
 * OAuth callback handler page
 * This page handles the redirect from OAuth providers
 */
const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const errorParam = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      // Handle OAuth errors
      if (errorParam) {
        console.error('OAuth error:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // If we have code and state, process the callback
      if (code && state) {
        try {
          // Call signInWithOAuth to complete the token exchange
          // The library will detect the callback parameters and exchange them for tokens
          const result = await lovable.auth.signInWithOAuth('google', {
            redirect_uri: window.location.origin + '/callback',
          });

          if (result.error) {
            console.error('OAuth exchange error:', result.error);
            setError(result.error.message || 'Authentication failed');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
          }

          // Success - navigate to home
          navigate('/', { replace: true });
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } else {
        // No OAuth params - redirect to login
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
