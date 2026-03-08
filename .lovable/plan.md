

## Plan: Upgrade MyGroupsPage to Interactive Group Management Dashboard

### Overview
Transform `MyGroupsPage.tsx` from a static list into a full management dashboard with Create Group FAB, per-card context menus (Edit/Leave/Hide/Delete), and a rich empty state. Reuse existing `GroupActionsMenu` logic and `EditGroupModal`.

### Changes

#### 1. `src/components/EnhancedGroupCard.tsx` — Add dropdown menu overlay

- Add new optional props: `isAdmin`, `onEdit`, `onLeave`, `onHide`, `onDelete`, `userId` (to know current user)
- Import `MoreVertical` icon and `DropdownMenu` components
- Add a three-dot button in the top-right corner of the card (absolute positioned, stops event propagation)
- Dropdown items:
  - **Admin**: Edit Group (Pencil icon), Hide Group (EyeOff), Leave Group (LogOut), Delete Group (Trash2, destructive)
  - **Member**: Hide Group (EyeOff), Leave Group (LogOut)
- The dropdown button only renders if action callbacks are provided

#### 2. `src/pages/MyGroupsPage.tsx` — Full dashboard upgrade

**New imports**: `Plus`, `Pencil`, `Target`, `Loader2` icons; `AlertDialog` components; `EditGroupModal`; `useToast`; `usePremiumCheck`; `JoinGroupModal`; `PremiumModal`

**New state**:
- `editModalOpen` + `editGroup` (group being edited)
- `confirmAction` (object with type: 'leave'|'hide'|'delete', groupId, groupName)
- `actionLoading` (boolean for destructive action spinner)
- `createModalOpen` (triggers navigation or inline create — reuse HomePage's create group Dialog pattern)

**Role detection per card**: Check `group.members.find(m => m.user_id === user?.id)?.role === 'admin'`

**Card context menu callbacks**:
- `onEdit`: opens `EditGroupModal` with that group's data
- `onLeave`: opens AlertDialog confirmation, calls `leaveGroup(groupId)` then `refreshGroups()`
- `onHide`: calls `hideGroup(groupId)` directly then `refreshGroups()`
- `onDelete`: opens AlertDialog confirmation, calls `deleteGroup(groupId)` then `refreshGroups()`

**FAB**: Fixed-position button bottom-right (above BottomNav, ~`bottom-24 right-6`) with `Plus` icon. Opens the same create group Dialog from HomePage (duplicated inline or extracted as shared component).

**Empty state**: When `groups.length === 0`, show a large `Card` with a `Target` icon, motivational text ("Start your first savings objective!"), and a prominent "Create Group" button.

#### 3. Confirmation dialogs (inside MyGroupsPage)

- Single `AlertDialog` controlled by `confirmAction` state
- Title/description change based on action type (leave/delete)
- Delete requires password verification (reuse pattern from `GroupActionsMenu`)
- Loading spinner on confirm button while promise resolves

### Files to modify
1. **`src/components/EnhancedGroupCard.tsx`** — Add optional action props + dropdown menu
2. **`src/pages/MyGroupsPage.tsx`** — Add FAB, card actions, modals, empty state, create group flow

### No database changes needed
All functions (`deleteGroup`, `leaveGroup`, `hideGroup`, `updateGroup`, `createGroup`) already exist in `AuthContext`.

