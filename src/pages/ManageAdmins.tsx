import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  KeyRound, 
  Mail, 
  UserCog, 
  RefreshCw,
  Power
} from 'lucide-react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { authService } from '@/services/authService';
import { AdminUserItem } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function ManageAdmins() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Create Admin Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createEmail, setCreateEmail] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [createRoleId, setCreateRoleId] = useState<number>(2); // Default to Admin
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<AdminUserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Fetch admin users
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await authService.getAdminUsers();
      setAdmins(data);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load admin users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle Create Admin Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim()) {
      showToast('Validation Error', 'Please enter a valid email address.', 'error');
      return;
    }
    if (!createPassword || createPassword.length < 4) {
      showToast('Validation Error', 'Password must be at least 4 characters long.', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      await authService.createAdminUser({
        email: createEmail.trim(),
        password: createPassword,
        role_id: createRoleId
      });
      showToast('Success', `Admin user ${createEmail} created successfully.`, 'success');
      setShowCreateModal(false);
      setCreateEmail('');
      setCreatePassword('');
      setCreateRoleId(2);
      fetchAdmins();
    } catch (err: any) {
      showToast('Creation Failed', err.message || 'Could not create admin user.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Toggle Active/Deactive Status
  const handleToggleStatus = async (admin: AdminUserItem) => {
    const newStatus = !admin.is_active;
    try {
      await authService.updateAdminUser(admin.id, { is_active: newStatus });
      showToast('Status Updated', `${admin.email} is now ${newStatus ? 'Active' : 'Deactivated'}.`, newStatus ? 'success' : 'info');
      fetchAdmins();
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Failed to update status.', 'error');
    }
  };

  // Handle Toggle Role (Super Admin <-> Admin)
  const handleToggleRole = async (admin: AdminUserItem) => {
    const newRoleId = admin.role_id === 1 ? 2 : 1;
    const newRoleName = newRoleId === 1 ? 'Super Admin' : 'Admin';
    try {
      await authService.updateAdminUser(admin.id, { role_id: newRoleId });
      showToast('Role Updated', `${admin.email} role changed to ${newRoleName}.`, 'success');
      fetchAdmins();
    } catch (err: any) {
      showToast('Role Update Failed', err.message || 'Failed to update role.', 'error');
    }
  };

  // Handle Delete Admin Submit
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await authService.deleteAdminUser(deleteTarget.id);
      showToast('Deleted', `Admin account ${deleteTarget.email} deleted.`, 'info');
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err: any) {
      showToast('Delete Failed', err.message || 'Failed to delete admin user.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered Admins
  const filteredAdmins = admins.filter(a => 
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.is_active).length;
  const superAdmins = admins.filter(a => a.role_id === 1).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#035352]/10 flex items-center justify-center text-[#035352] shrink-0 border border-[#035352]/20">
            <UserCog className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#172525] tracking-tight">Manage Administrators</h1>
            <p className="text-xs text-slate-500 font-medium">
              Super Admin Control Panel to manage system administrators, role assignments, and active/deactive status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAdmins}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add New Admin
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Admins</p>
            <p className="text-2xl font-black text-[#172525] mt-1">{totalAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <UserCog className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Admins</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Super Admins</p>
            <p className="text-2xl font-black text-[#035352] mt-1">{superAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3E8BC]/50 flex items-center justify-center text-[#035352]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="max-w-md w-full">
            <Input
              placeholder="Search admin by email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredAdmins.length} of {admins.length} accounts
          </span>
        </div>

        {/* Admins Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#035352] animate-spin" />
            <p className="text-sm font-semibold">Loading admin users...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No Admin Accounts Found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new admin account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Admin Email</th>
                  <th className="py-3.5 px-4">Role & Level</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAdmins.map((admin) => {
                  const isCurrent = currentUser?.id === admin.id || currentUser?.email === admin.email;
                  const isSuper = admin.role_id === 1;

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Email */}
                      <td className="py-4 px-4 font-bold text-[#172525]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSuper ? 'bg-[#035352] text-[#F3E8BC]' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#172525] text-sm flex items-center gap-2">
                              {admin.email}
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">User ID: #{admin.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-[#F3E8BC]/40 text-[#035352] border border-[#035352]/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#035352]" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCog className="w-3.5 h-3.5 text-blue-600" />
                            Admin
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {admin.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active/Inactive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(admin)}
                            disabled={isCurrent}
                            title={admin.is_active ? 'Deactivate Admin' : 'Activate Admin'}
                            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                              admin.is_active
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            } ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{admin.is_active ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          {/* Toggle Role */}
                          <button
                            type="button"
                            onClick={() => handleToggleRole(admin)}
                            disabled={isCurrent}
                            title="Change Role"
                            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 ${
                              isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isSuper ? 'Make Admin' : 'Make Super'}</span>
                          </button>

                          {/* Delete Account */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(admin)}
                              title="Delete Admin"
                              className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Administrator"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 my-2">
          <p className="text-xs text-slate-600">
            Create a new administrator account for Digi-Gate Admin Portal.
          </p>

          <Input
            label="Admin Email Address"
            type="email"
            placeholder="admin@digigate.com"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Select Role Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreateRoleId(2)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  createRoleId === 2
                    ? 'border-[#035352] bg-[#035352]/5 text-[#035352] font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-extrabold">Admin (Standard)</span>
                <span className="text-[10px] text-slate-500 font-normal">Can manage orgs, visits, and visitor requests.</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateRoleId(1)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  createRoleId === 1
                    ? 'border-[#035352] bg-[#F3E8BC]/30 text-[#035352] font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#035352]" />
                  Super Admin
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Full control + can manage admin accounts.</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createLoading}>
              Create Admin Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Administrator Account"
      >
        <div className="space-y-4 my-2">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Are you sure you want to permanently delete <strong>{deleteTarget?.email}</strong>? This action cannot be undone.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
              isLoading={deleteLoading}
              onClick={handleDeleteSubmit}
            >
              Delete Admin Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
