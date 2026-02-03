import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GroupProgress {
  id: string;
  name: string;
  imageUrl: string | null;
  currentAmount: number;
  goalAmount: number;
  progress: number;
  weeklyAmount: number;
}

interface WeeklySummary {
  totalSavedThisWeek: number;
  contributionCount: number;
  topGroup: GroupProgress | null;
  groupProgress: GroupProgress[];
  hasActivity: boolean;
}

const LAST_SUMMARY_KEY = 'billi_last_weekly_summary';
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const useWeeklySummary = (userId: string | undefined) => {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!userId) return null;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setLoading(false);
        return null;
      }

      const response = await supabase.functions.invoke('weekly-summary', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.error) {
        console.error('Weekly summary error:', response.error);
        setLoading(false);
        return null;
      }

      setSummary(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch weekly summary:', error);
      setLoading(false);
      return null;
    }
  }, [userId]);

  const checkShouldShowSummary = useCallback(() => {
    const lastShown = localStorage.getItem(LAST_SUMMARY_KEY);
    if (!lastShown) {
      return true;
    }
    
    const lastShownDate = new Date(lastShown);
    const now = new Date();
    const timeSinceLastShown = now.getTime() - lastShownDate.getTime();
    
    return timeSinceLastShown >= WEEK_IN_MS;
  }, []);

  const markSummaryShown = useCallback(() => {
    localStorage.setItem(LAST_SUMMARY_KEY, new Date().toISOString());
    setShouldShow(false);
  }, []);

  const forceShowSummary = useCallback(async () => {
    await fetchSummary();
    setShouldShow(true);
  }, [fetchSummary]);

  useEffect(() => {
    if (userId && checkShouldShowSummary()) {
      fetchSummary().then((data) => {
        if (data?.hasActivity) {
          setShouldShow(true);
        }
      });
    }
  }, [userId, checkShouldShowSummary, fetchSummary]);

  return {
    summary,
    loading,
    shouldShow,
    markSummaryShown,
    forceShowSummary,
    fetchSummary,
  };
};
