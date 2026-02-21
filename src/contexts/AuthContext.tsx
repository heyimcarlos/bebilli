import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { useGroups, GroupWithDetails } from '@/hooks/useGroups';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  groups: GroupWithDetails[];
  loading: boolean;
  groupsLoading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, country?: string, city?: string, language?: string, currency?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
  createGroup: (name: string, goalAmount: number, imageUrl?: string, description?: string, groupType?: 'individual' | 'shared', category?: string) => Promise<any>;
  joinGroupByCode: (inviteCode: string) => Promise<any>;
  addContribution: (groupId: string, amount: number, note?: string) => Promise<any>;
  addWithdrawal: (groupId: string, amount: number, note?: string) => Promise<any>;
  leaveGroup: (groupId: string) => Promise<any>;
  updateGroup: (groupId: string, updates: { name?: string; description?: string; image_url?: string; goal_amount?: number }) => Promise<any>;
  deleteGroup: (groupId: string) => Promise<any>;
  hideGroup: (groupId: string) => Promise<any>;
  unhideGroup: (groupId: string) => Promise<any>;
  refreshGroups: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const groupsHook = useGroups(auth.user?.id);

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        profile: auth.profile,
        groups: groupsHook.groups,
        loading: auth.loading,
        groupsLoading: groupsHook.loading,
        signUp: auth.signUp,
        signIn: auth.signIn,
        signOut: auth.signOut,
        updateProfile: auth.updateProfile,
        createGroup: groupsHook.createGroup,
        joinGroupByCode: groupsHook.joinGroupByCode,
        addContribution: groupsHook.addContribution,
        addWithdrawal: groupsHook.addWithdrawal,
        leaveGroup: groupsHook.leaveGroup,
        updateGroup: groupsHook.updateGroup,
        deleteGroup: groupsHook.deleteGroup,
        hideGroup: groupsHook.hideGroup,
        unhideGroup: groupsHook.unhideGroup,
        refreshGroups: groupsHook.fetchGroups,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
