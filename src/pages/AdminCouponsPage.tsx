import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Tag, Trash2, Copy, Check, Loader2, Percent, DollarSign, Calendar, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminCouponsPageProps {
  onBack: () => void;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

const AdminCouponsPage: React.FC<AdminCouponsPageProps> = ({ onBack }) => {
  const { t } = useApp();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // New coupon form
  const [showForm, setShowForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'amount',
    discountValue: '',
    maxUses: '',
    validUntil: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'BILLI';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code }));
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discountValue) {
      toast({
        title: t('error') || 'Error',
        description: t('fillRequiredFields') || 'Please fill required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    const couponData: Record<string, unknown> = {
      code: newCoupon.code.toUpperCase(),
      description: newCoupon.description || null,
      created_by: user?.id,
    };

    if (newCoupon.discountType === 'percentage') {
      couponData.discount_percentage = parseInt(newCoupon.discountValue);
    } else {
      couponData.discount_amount = parseFloat(newCoupon.discountValue);
    }

    if (newCoupon.maxUses) {
      couponData.max_uses = parseInt(newCoupon.maxUses);
    }

    if (newCoupon.validUntil) {
      couponData.valid_until = new Date(newCoupon.validUntil).toISOString();
    }

    const { error } = await supabase
      .from('subscription_coupons')
      .insert([couponData as any]);

    setCreating(false);

    if (error) {
      toast({
        title: t('error') || 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '🎉 ' + (t('couponCreated') || 'Coupon Created'),
        description: t('couponCreatedDesc') || 'The coupon is now active',
      });
      setShowForm(false);
      setNewCoupon({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        validUntil: '',
      });
      fetchCoupons();
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('subscription_coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (!error) {
      setCoupons(prev => 
        prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)
      );
      toast({
        title: coupon.is_active ? '🔴 ' + (t('couponDeactivated') || 'Coupon Deactivated') : '🟢 ' + (t('couponActivated') || 'Coupon Activated'),
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const { error } = await supabase
      .from('subscription_coupons')
      .delete()
      .eq('id', couponId);

    if (!error) {
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      toast({
        title: '🗑️ ' + (t('couponDeleted') || 'Coupon Deleted'),
      });
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
          <motion.button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t('couponManager') || 'Coupon Manager'}</h1>
            <p className="text-sm text-muted-foreground">{t('manageDiscountCoupons') || 'Manage subscription discount coupons'}</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('newCoupon') || 'New Coupon'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.length}</p>
                  <p className="text-xs text-muted-foreground">{t('totalCoupons') || 'Total Coupons'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.filter(c => c.is_active).length}</p>
                  <p className="text-xs text-muted-foreground">{t('activeCoupons') || 'Active'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.current_uses, 0)}</p>
                  <p className="text-xs text-muted-foreground">{t('totalUses') || 'Total Uses'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Coupon Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {t('createNewCoupon') || 'Create New Coupon'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('couponCode') || 'Coupon Code'} *</label>
                    <div className="flex gap-2">
                      <Input
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="BILLI20"
                        className="uppercase"
                        maxLength={20}
                      />
                      <Button variant="outline" onClick={generateRandomCode} type="button">
                        {t('generate') || 'Generate'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('description') || 'Description'}</label>
                    <Input
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Welcome discount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('discountType') || 'Discount Type'} *</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newCoupon.discountType === 'percentage' ? 'default' : 'outline'}
                        onClick={() => setNewCoupon(prev => ({ ...prev, discountType: 'percentage' }))}
                        className="flex-1 gap-2"
                      >
                        <Percent className="w-4 h-4" />
                        {t('percentage') || 'Percentage'}
                      </Button>
                      <Button
                        type="button"
                        variant={newCoupon.discountType === 'amount' ? 'default' : 'outline'}
                        onClick={() => setNewCoupon(prev => ({ ...prev, discountType: 'amount' }))}
                        className="flex-1 gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        {t('fixedAmount') || 'Fixed Amount'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {newCoupon.discountType === 'percentage' ? t('discountPercent') || 'Discount (%)' : t('discountAmount') || 'Discount (CAD)'} *
                    </label>
                    <Input
                      type="number"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, discountValue: e.target.value }))}
                      placeholder={newCoupon.discountType === 'percentage' ? '20' : '2.00'}
                      min={newCoupon.discountType === 'percentage' ? 1 : 0.01}
                      max={newCoupon.discountType === 'percentage' ? 100 : undefined}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('maxUses') || 'Max Uses'} ({t('optional') || 'optional'})</label>
                    <Input
                      type="number"
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, maxUses: e.target.value }))}
                      placeholder="100"
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('validUntil') || 'Valid Until'} ({t('optional') || 'optional'})</label>
                    <Input
                      type="date"
                      value={newCoupon.validUntil}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    {t('cancel') || 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleCreateCoupon}
                    disabled={creating}
                    className="flex-1 gap-2"
                  >
                    {creating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {t('createCoupon') || 'Create Coupon'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Coupons List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t('allCoupons') || 'All Coupons'}</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('noCouponsYet') || 'No coupons created yet'}</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createFirstCoupon') || 'Create your first coupon'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            coupons.map((coupon, index) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!coupon.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        coupon.discount_percentage 
                          ? 'bg-primary/10' 
                          : 'bg-green-500/10'
                      }`}>
                        {coupon.discount_percentage ? (
                          <Percent className="w-6 h-6 text-primary" />
                        ) : (
                          <DollarSign className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{coupon.code}</h3>
                          <button
                            onClick={() => copyCode(coupon.code, coupon.id)}
                            className="p-1 rounded hover:bg-secondary transition-colors"
                          >
                            {copiedId === coupon.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          {!coupon.is_active && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              {t('inactive') || 'Inactive'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {coupon.description || (t('noDescription') || 'No description')}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {coupon.discount_percentage 
                              ? `${coupon.discount_percentage}% OFF`
                              : `$${coupon.discount_amount} OFF`
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''} {t('uses') || 'uses'}
                          </span>
                          {coupon.valid_until && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(coupon.valid_until).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(coupon)}
                        >
                          {coupon.is_active ? (
                            <ToggleRight className="w-6 h-6 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCouponsPage;
