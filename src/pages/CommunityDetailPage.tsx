import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, MessageCircle, LogOut, Loader2, Trash2, Image, X, PenSquare } from 'lucide-react';
import { useCommunityPosts, Community } from '@/hooks/useCommunities';
import { useAuthContext } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';
import PostReactions from '@/components/PostReactions';
import PostReplies from '@/components/PostReplies';
import { supabase } from '@/integrations/supabase/client';

interface CommunityDetailPageProps {
  community: Community;
  onBack: () => void;
  onLeave: () => void;
}

const CommunityDetailPage: React.FC<CommunityDetailPageProps> = ({ community, onBack, onLeave }) => {
  const { user } = useAuthContext();
  const { t } = useApp();
  const { posts, loading, addPost, deletePost } = useCommunityPosts(community.id, user?.id);
  const [showComposer, setShowComposer] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [posts]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('community-images').upload(fileName, file);
    if (error) { console.error('Upload error:', error); return null; }
    const { data } = supabase.storage.from('community-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedImage) || sending) return;
    setSending(true);
    let imageUrl: string | null = null;
    if (selectedImage) {
      setUploadingImage(true);
      imageUrl = await uploadImage(selectedImage);
      setUploadingImage(false);
    }
    const { error } = await addPost(newMessage.trim(), imageUrl || undefined);
    if (!error) {
      setNewMessage('');
      clearImage();
      setShowComposer(false);
    }
    setSending(false);
  };

  const handleDelete = async (postId: string) => { await deletePost(postId); };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return t('justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative">
        <div className="h-32 overflow-hidden">
          <img src={community.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'} alt={community.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="bg-background/50 backdrop-blur-sm hover:bg-background/70"><ArrowLeft className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={onLeave} className="bg-background/50 backdrop-blur-sm hover:bg-destructive/80 hover:text-destructive-foreground text-destructive">
            <LogOut className="w-4 h-4 mr-1" />{t('leave') || 'Leave'}
          </Button>
        </div>
        <div className="px-6 -mt-8 relative">
          <h1 className="text-xl font-bold">{community.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{community.members_count} {t('members')}</span></div>
            <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /><span>{posts.length} {t('posts') || 'posts'}</span></div>
          </div>
        </div>
      </div>

      {/* Create Post Button - always visible */}
      <div className="px-4 py-3">
        <Button onClick={() => setShowComposer(!showComposer)} className="w-full h-11 btn-primary text-primary-foreground font-medium rounded-xl gap-2">
          <PenSquare className="w-4 h-4" />
          {t('createPost') || 'Create Post'}
        </Button>
      </div>

      {/* Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 overflow-hidden">
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 mb-2">
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t('shareATip') || 'Share a tip, photo or story...'} className="bg-secondary resize-none min-h-[80px]" />
              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-24 rounded-lg" />
                  <button onClick={clearImage} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                  <Image className="w-4 h-4 mr-1" /> {t('addPhoto') || 'Photo'}
                </Button>
                <div className="flex-1" />
                <Button size="sm" onClick={handleSend} disabled={(!newMessage.trim() && !selectedImage) || sending} className="btn-primary text-primary-foreground">
                  {sending || uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> {t('post') || 'Post'}</>}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">{t('noPostsYet') || 'No posts yet'}</h3>
            <p className="text-sm text-muted-foreground">{t('beFirstToPost') || 'Be the first to share a tip!'}</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post) => {
              const isOwn = post.user_id === user?.id;
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={post.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary p-0"><DefaultAvatar name={post.profile.name} size={36} /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{post.profile.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{formatTime(post.created_at)}</span>
                    </div>
                    {isOwn && (
                      <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  {post.content && <p className="text-sm whitespace-pre-wrap">{post.content}</p>}
                  {post.image_url && (
                    <img src={post.image_url} alt="Post image" className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(post.image_url!, '_blank')} />
                  )}
                  <PostReactions postId={post.id} userId={user?.id} isOwn={isOwn} postOwnerId={post.user_id} postOwnerName={post.profile.name} />
                  <PostReplies postId={post.id} userId={user?.id} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default CommunityDetailPage;
