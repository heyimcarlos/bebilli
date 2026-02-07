import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

/**
 * Hook to handle OAuth callback on page load
 * Detects if we're returning from an OAuth flow and completes the authentication
 */
export const useOAuthCallback = () => {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if URL has OAuth-related query parameters (from lovable cloud auth)
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const hasCode = queryParams.has('code');
      const hasState = queryParams.has('state');
      const hasAccessToken = hashParams.has('access_token');
      const hasError = queryParams.has('error') || hashParams.has('error');
      
      // If we have OAuth callback parameters, complete the auth flow
      if (hasCode && hasState) {
        setProcessing(true);
        
        try {
          // Call signInWithOAuth to complete the callback exchange
          // The lovable auth library will detect the callback params and exchange for tokens
          const result = await lovable.auth.signInWithOAuth('google', {
            redirect_uri: window.location.origin,
          });
          
          if (result.error) {
            console.error('OAuth callback error:', result.error);
          }
          
          // Clean up URL - remove OAuth parameters
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.origin);
          }
        } catch (err) {
          console.error('Error processing OAuth callback:', err);
          // Clean up URL even on error
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.origin);
          }
        } finally {
          setProcessing(false);
          setProcessed(true);
        }
      } else if (hasAccessToken) {
        // Hash fragment contains access token (implicit flow)
        setProcessing(true);
        try {
          await supabase.auth.getSession();
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.origin);
          }
        } finally {
          setProcessing(false);
          setProcessed(true);
        }
      } else if (hasError) {
        // Handle OAuth error
        const error = queryParams.get('error') || hashParams.get('error');
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');
        console.error('OAuth error:', error, errorDescription);
        
        // Clean up URL
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.origin);
        }
        setProcessed(true);
      } else {
        // No OAuth params, just continue
        setProcessed(true);
      }
    };

    handleOAuthCallback();
  }, []);

  return { processing, processed };
};
