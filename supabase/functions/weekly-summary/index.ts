import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get date range for the past week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user's groups
    const { data: memberships } = await supabase
      .from('group_memberships')
      .select('group_id')
      .eq('user_id', user.id);

    if (!memberships?.length) {
      return new Response(
        JSON.stringify({
          totalSavedThisWeek: 0,
          contributionCount: 0,
          topGroup: null,
          groupProgress: [],
          hasActivity: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groupIds = memberships.map(m => m.group_id);

    // Get contributions this week from user's groups
    const { data: weeklyContributions } = await supabase
      .from('contributions')
      .select('amount, group_id, user_id')
      .in('group_id', groupIds)
      .gte('created_at', weekAgo.toISOString());

    // Get user's own contributions this week
    const userContributions = (weeklyContributions || []).filter(c => c.user_id === user.id);
    const totalSavedThisWeek = userContributions.reduce((sum, c) => sum + Number(c.amount), 0);

    // Get groups with their goals
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, goal_amount, image_url')
      .in('id', groupIds);

    // Get all-time contributions for progress calculation
    const { data: allContributions } = await supabase
      .from('contributions')
      .select('amount, group_id')
      .in('group_id', groupIds);

    // Calculate progress for each group
    const groupProgress = (groups || []).map(group => {
      const groupContribs = (allContributions || []).filter(c => c.group_id === group.id);
      const currentAmount = groupContribs.reduce((sum, c) => sum + Number(c.amount), 0);
      const progress = group.goal_amount > 0 ? (currentAmount / group.goal_amount) * 100 : 0;
      
      const weeklyGroupContribs = (weeklyContributions || []).filter(c => c.group_id === group.id);
      const weeklyAmount = weeklyGroupContribs.reduce((sum, c) => sum + Number(c.amount), 0);

      return {
        id: group.id,
        name: group.name,
        imageUrl: group.image_url,
        currentAmount,
        goalAmount: group.goal_amount,
        progress: Math.min(progress, 100),
        weeklyAmount,
      };
    }).sort((a, b) => b.weeklyAmount - a.weeklyAmount);

    const topGroup = groupProgress.length > 0 ? groupProgress[0] : null;

    return new Response(
      JSON.stringify({
        totalSavedThisWeek,
        contributionCount: userContributions.length,
        topGroup,
        groupProgress,
        hasActivity: (weeklyContributions || []).length > 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
