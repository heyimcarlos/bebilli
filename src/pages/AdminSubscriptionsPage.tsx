import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Crown, DollarSign, TrendingDown, Users, Edit2, Check, X,
  Building2, ShieldCheck, Globe, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { currencySymbols, type ExtendedCurrency } from '@/lib/localization';

interface AdminSubscriptionsPageProps {
  onBack: () => void;
}

interface RegionalPrice {
  country: string;
  flag: string;
  currency: ExtendedCurrency;
  monthlyPrice: number;
  annualPrice: number;
}

interface BankDetails {
  bankName: string;
  accountHolder: string;
  swiftCode: string;
  accountNumber: string;
  status: 'connected' | 'disconnected';
}

const initialPricing: RegionalPrice[] = [
  { country: 'Brazil', flag: '🇧🇷', currency: 'BRL', monthlyPrice: 19.90, annualPrice: 199.00 },
  { country: 'Canada', flag: '🇨🇦', currency: 'CAD', monthlyPrice: 5.90, annualPrice: 59.00 },
  { country: 'United States', flag: '🇺🇸', currency: 'USD', monthlyPrice: 4.99, annualPrice: 49.90 },
  { country: 'Portugal', flag: '🇵🇹', currency: 'EUR', monthlyPrice: 3.90, annualPrice: 39.00 },
  { country: 'France', flag: '🇫🇷', currency: 'EUR', monthlyPrice: 3.90, annualPrice: 39.00 },
  { country: 'Mexico', flag: '🇲🇽', currency: 'USD', monthlyPrice: 4.99, annualPrice: 49.90 },
];

const initialBank: BankDetails = {
  bankName: 'Wise Business',
  accountHolder: 'Billi Ltd.',
  swiftCode: 'TRWI****',
  accountNumber: '****5678',
  status: 'connected',
};

const AdminSubscriptionsPage: React.FC<AdminSubscriptionsPageProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { t } = useApp();

  const [loading, setLoading] = useState(true);
  const [activeVips, setActiveVips] = useState(0);
  const [mrrByCurrency, setMrrByCurrency] = useState<Record<string, number>>({});
  const [churnRate, setChurnRate] = useState(0);
  const [pricing, setPricing] = useState<RegionalPrice[]>(initialPricing);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ monthlyPrice: 0, annualPrice: 0 });
  const [bankDetails, setBankDetails] = useState<BankDetails>(initialBank);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState<BankDetails>(initialBank);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch active VIP subscriptions
      const { data: subs, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      setActiveVips(subs?.length || 0);

      // Calculate MRR by currency
      const mrr: Record<string, number> = {};
      (subs || []).forEach(sub => {
        const cur = sub.currency || 'CAD';
        const monthly = sub.plan_type === 'annual' ? sub.amount / 12 : sub.amount;
        mrr[cur] = (mrr[cur] || 0) + monthly;
      });
      setMrrByCurrency(mrr);

      // Calculate churn (cancelled in last 30 days / total active at start)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: cancelled } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('status', 'cancelled')
        .gte('cancelled_at', thirtyDaysAgo.toISOString());

      const totalBase = (subs?.length || 0) + (cancelled?.length || 0);
      setChurnRate(totalBase > 0 ? ((cancelled?.length || 0) / totalBase) * 100 : 0);
    } catch (err) {
      console.error('Error fetching subscription metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalMrr = useMemo(() => {
    return Object.values(mrrByCurrency).reduce((sum, v) => sum + v, 0);
  }, [mrrByCurrency]);

  const handleEditRow = (idx: number) => {
    setEditingRow(idx);
    setEditValues({ monthlyPrice: pricing[idx].monthlyPrice, annualPrice: pricing[idx].annualPrice });
  };

  const handleSaveRow = (idx: number) => {
    const updated = [...pricing];
    updated[idx] = { ...updated[idx], monthlyPrice: editValues.monthlyPrice, annualPrice: editValues.annualPrice };
    setPricing(updated);
    setEditingRow(null);
    toast({ title: 'Price updated', description: `${updated[idx].country} pricing saved.` });
  };

  const handleCancelEdit = () => setEditingRow(null);

  const handleSaveBank = () => {
    setBankDetails(bankForm);
    setEditingBank(false);
    toast({ title: 'Bank details updated' });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const sym = currencySymbols[currency as ExtendedCurrency] || currency;
    return `${sym} ${amount.toFixed(2)}`;
  };

  const cardAnim = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35 },
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">VIP Subscriptions & Financials</h1>
          <p className="text-sm text-muted-foreground">Manage pricing, revenue, and payouts</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Metrics Overview ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div {...cardAnim}>
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active VIP Subscribers</CardTitle>
                  <Crown className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{activeVips}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...cardAnim} transition={{ delay: 0.05 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">
                    {totalMrr > 0 ? `CA$ ${totalMrr.toFixed(2)}` : '—'}
                  </p>
                  {Object.keys(mrrByCurrency).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(mrrByCurrency).map(([cur, val]) => (
                        <Badge key={cur} variant="secondary" className="text-xs">
                          {formatCurrency(val, cur)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...cardAnim} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate (30d)</CardTitle>
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{churnRate.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Regional Pricing ── */}
          <motion.div {...cardAnim} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Regional Pricing Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country / Region</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Monthly VIP</TableHead>
                      <TableHead className="text-right">Annual VIP</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricing.map((row, idx) => (
                      <TableRow key={row.country}>
                        <TableCell className="font-medium">
                          <span className="mr-2">{row.flag}</span>
                          {row.country}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.currency}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingRow === idx ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.monthlyPrice}
                              onChange={e => setEditValues(v => ({ ...v, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                              className="w-28 ml-auto text-right"
                            />
                          ) : (
                            formatCurrency(row.monthlyPrice, row.currency) + '/mo'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingRow === idx ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.annualPrice}
                              onChange={e => setEditValues(v => ({ ...v, annualPrice: parseFloat(e.target.value) || 0 }))}
                              className="w-28 ml-auto text-right"
                            />
                          ) : (
                            formatCurrency(row.annualPrice, row.currency) + '/yr'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingRow === idx ? (
                            <div className="flex gap-1 justify-end">
                              <Button size="icon" variant="ghost" onClick={() => handleSaveRow(idx)}>
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleEditRow(idx)}>
                              <Edit2 className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Bank & Payout Settings ── */}
          <motion.div {...cardAnim} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Billi Bank & Payout Settings</CardTitle>
                  </div>
                  <Badge
                    className={
                      bankDetails.status === 'connected'
                        ? 'bg-success/15 text-success border-success/30'
                        : 'bg-destructive/15 text-destructive border-destructive/30'
                    }
                    variant="outline"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {bankDetails.status === 'connected' ? 'Payouts Active' : 'Disconnected'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {editingBank ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                      <Input value={bankForm.bankName} onChange={e => setBankForm(f => ({ ...f, bankName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                      <Input value={bankForm.accountHolder} onChange={e => setBankForm(f => ({ ...f, accountHolder: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Routing / SWIFT Code</label>
                      <Input value={bankForm.swiftCode} onChange={e => setBankForm(f => ({ ...f, swiftCode: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                      <Input value={bankForm.accountNumber} onChange={e => setBankForm(f => ({ ...f, accountNumber: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditingBank(false)}>Cancel</Button>
                      <Button onClick={handleSaveBank}>Save Details</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Bank Name" value={bankDetails.bankName} />
                    <InfoField label="Account Holder" value={bankDetails.accountHolder} />
                    <InfoField label="Routing / SWIFT Code" value={bankDetails.swiftCode} />
                    <InfoField label="Account Number" value={bankDetails.accountNumber} />
                    <div className="md:col-span-2 flex justify-end">
                      <Button variant="outline" onClick={() => { setBankForm(bankDetails); setEditingBank(true); }}>
                        <Edit2 className="h-4 w-4 mr-1" /> Edit Details
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-base font-semibold text-foreground">{value}</p>
  </div>
);

export default AdminSubscriptionsPage;
