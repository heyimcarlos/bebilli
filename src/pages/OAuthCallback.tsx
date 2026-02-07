import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * OAuth callback handler page
 * Handles the redirect from OAuth providers and exchanges code for session
 */
const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for errors first
        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        // Check for code (authorization code flow)
        const code = searchParams.get('code');
        
        if (code) {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
          }
          
          if (data.session) {
            // Success - navigate to home
            navigate('/', { replace: true });
            return;
          }
        }

        // Check for access_token in hash (implicit flow)
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // The session should already be set by Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            navigate('/', { replace: true });
            return;
          }
        }

        // If we reach here without tokens, check if there's already a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          navigate('/', { replace: true });
          return;
        }

        // No valid auth params and no session - redirect to login
        console.log('No auth params found, redirecting to login');
        navigate('/login', { replace: true });
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
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
