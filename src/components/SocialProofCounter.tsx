import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedCounter from '@/components/animations/AnimatedCounter';

const SocialProofCounter: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch initial count from unprotected view
    const fetchCount = async () => {
      const { count: total, error } = await supabase
        .from('groups_public')
        .select('*', { count: 'exact', head: true });

      if (!error && total !== null) {
        setCount(total);
      }
    };

    fetchCount();

    // Subscribe to realtime INSERT events on groups
    const channel = supabase
      .channel('social-proof-groups')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'groups' },
        () => {
          setCount((prev) => (prev !== null ? prev + 1 : prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-md bg-white/70 dark:bg-card/70 border border-primary/20 shadow-sm mb-4">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
      </span>
      <span className="text-sm text-muted-foreground">
        Join{' '}
        <AnimatedCounter
          value={count}
          duration={1.5}
          className="font-bold text-primary"
        />{' '}
        active saving groups worldwide right now.
      </span>
    </div>
  );
};

export default SocialProofCounter;
