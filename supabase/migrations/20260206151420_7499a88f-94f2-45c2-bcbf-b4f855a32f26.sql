-- Add type column to contributions table to support withdrawals
ALTER TABLE public.contributions 
ADD COLUMN type text NOT NULL DEFAULT 'deposit' 
CHECK (type IN ('deposit', 'withdrawal'));

-- Add index for better query performance
CREATE INDEX idx_contributions_type ON public.contributions(type);

-- Comment for documentation
COMMENT ON COLUMN public.contributions.type IS 'Type of contribution: deposit (add money) or withdrawal (remove money)';