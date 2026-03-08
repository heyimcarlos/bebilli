import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Upload, X, Loader2, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface Member {
  user_id: string;
  profile: { name: string; avatar_url: string | null };
}

interface GoalProofSubmitProps {
  groupId: string;
  userId: string;
  totalAmount: number;
  members: Member[];
  formatCurrency: (amount: number) => string;
}

interface Proof {
  id: string;
  user_id: string;
  image_url: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Vote {
  id: string;
  proof_id: string;
  user_id: string;
  approved: boolean;
}

const GoalProofSubmit: React.FC<GoalProofSubmitProps> = ({
  groupId, userId, totalAmount, members, formatCurrency
}) => {
  const { t } = useApp();
  const { toast } = useToast();
  const [proof, setProof] = useState<Proof | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProof = async () => {
    const { data } = await supabase
      .from('goal_completion_proofs')
      .select('*')
      .eq('group_id', groupId)
      .maybeSingle();
    
    if (data) {
      setProof(data as Proof);
      const { data: votesData } = await supabase
        .from('goal_proof_votes')
        .select('*')
        .eq('proof_id', data.id);
      setVotes((votesData || []) as Vote[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProof(); }, [groupId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!imageFile) return;
    setSubmitting(true);

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${userId}/goal-proof-${Date.now()}.${fileExt}`;
    const { error: uploadErr } = await supabase.storage.from('receipt-images').upload(fileName, imageFile);
    if (uploadErr) {
      toast({ title: t('error'), description: t('receiptUploadError') || 'Upload failed', variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('receipt-images').getPublicUrl(fileName);

    const { error } = await supabase.from('goal_completion_proofs').insert({
      group_id: groupId,
      user_id: userId,
      image_url: urlData.publicUrl,
      total_amount: totalAmount,
    });

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅', description: t('proofSubmitted') || 'Proof submitted for approval!' });
      setImageFile(null);
      setImagePreview(null);
      await fetchProof();
    }
    setSubmitting(false);
  };

  const handleVote = async (approved: boolean) => {
    if (!proof) return;
    const { error } = await supabase.from('goal_proof_votes').insert({
      proof_id: proof.id,
      user_id: userId,
      approved,
    });
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: approved ? '👍' : '👎', description: approved ? (t('voteApproved') || 'You approved!') : (t('voteRejected') || 'You rejected.') });
      await fetchProof();
    }
  };

  if (loading) return null;

  const isOwner = proof?.user_id === userId;
  const hasVoted = votes.some(v => v.user_id === userId);
  const otherMembers = members.filter(m => m.user_id !== proof?.user_id);
  const approvalCount = votes.filter(v => v.approved).length;
  const rejectionCount = votes.filter(v => !v.approved).length;

  // No proof yet — show submission UI for any member
  if (!proof) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
              {t('goalReached') || '🏆 Goal Reached!'}
            </p>
            <p className="text-sm font-semibold">
              {t('submitProofDesc') || 'Submit a proof photo with the total amount for group approval.'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">{t('totalInvested') || 'Total invested'}</p>
          <p className="text-xl font-bold text-success">{formatCurrency(totalAmount)}</p>
        </div>

        <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
        
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Proof" className="w-full rounded-xl border border-border max-h-48 object-cover" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full h-12 border-dashed">
            <Image className="w-4 h-4 mr-2" />
            {t('uploadProofPhoto') || 'Upload proof photo'}
          </Button>
        )}

        <Button
          onClick={handleSubmitProof}
          disabled={!imageFile || submitting}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
          {t('submitForApproval') || 'Submit for approval'}
        </Button>
      </motion.div>
    );
  }

  // Proof exists — show proof card with voting
  const statusIcon = proof.status === 'approved'
    ? <CheckCircle className="w-5 h-5 text-success" />
    : proof.status === 'rejected'
    ? <XCircle className="w-5 h-5 text-destructive" />
    : <Clock className="w-5 h-5 text-amber-500" />;

  const statusLabel = proof.status === 'approved'
    ? (t('proofApproved') || 'Approved ✅')
    : proof.status === 'rejected'
    ? (t('proofRejected') || 'Rejected ❌')
    : (t('pendingApproval') || 'Pending approval');

  const proofOwner = members.find(m => m.user_id === proof.user_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{t('goalCompletionProof') || 'Goal Completion Proof'}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {statusIcon}
            <span className="font-medium">{statusLabel}</span>
          </div>
        </div>
        <p className="text-lg font-bold text-success">{formatCurrency(proof.total_amount)}</p>
      </div>

      {/* Proof image */}
      <img
        src={proof.image_url}
        alt="Goal proof"
        className="w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(proof.image_url, '_blank')}
      />

      {/* Submitted by */}
      <div className="p-4 space-y-3">
        {proofOwner && (
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="w-6 h-6">
              <AvatarImage src={proofOwner.profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary p-0">
                <DefaultAvatar name={proofOwner.profile.name} size={24} />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{proofOwner.profile.name}</span>
          </div>
        )}

        {/* Vote progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('approvals') || 'Approvals'}: {approvalCount}/{otherMembers.length}</span>
            <span>{t('rejections') || 'Rejections'}: {rejectionCount}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${otherMembers.length > 0 ? (approvalCount / otherMembers.length) * 100 : 0}%` }}
              className="h-full bg-success rounded-full"
            />
          </div>
          {/* Voter avatars */}
          <div className="flex flex-wrap gap-1">
            {otherMembers.map(m => {
              const vote = votes.find(v => v.user_id === m.user_id);
              return (
                <div key={m.user_id} className={`relative rounded-full ${vote ? (vote.approved ? 'ring-2 ring-success' : 'ring-2 ring-destructive') : 'ring-1 ring-muted opacity-40'}`}>
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={m.profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary p-0">
                      <DefaultAvatar name={m.profile.name} size={28} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vote buttons (only for non-owner, hasn't voted, proof is pending) */}
        {!isOwner && !hasVoted && proof.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleVote(true)}
              className="flex-1 h-11 bg-success/10 hover:bg-success/20 text-success border border-success/20 font-semibold"
              variant="outline"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              {t('approve') || 'Approve'}
            </Button>
            <Button
              onClick={() => handleVote(false)}
              className="flex-1 h-11 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 font-semibold"
              variant="outline"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              {t('reject') || 'Reject'}
            </Button>
          </div>
        )}

        {hasVoted && proof.status === 'pending' && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            {t('alreadyVoted') || 'You already voted. Waiting for others...'}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default GoalProofSubmit;
