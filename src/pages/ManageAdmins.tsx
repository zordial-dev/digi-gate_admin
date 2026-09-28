import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  UserCog, 
  RefreshCw,
  Clock,
  XCircle,
  Lock,
  Unlock,
  Ban
} from 'lucide-react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
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

  // Handle Approve Admin Request (works for pending or denied)
  const handleApprove = async (admin: AdminUserItem) => {
    try {
      await authService.updateAdminUser(admin.id, { is_approved: 1, is_active: true });
      showToast(
        'Admin Approved', 
        `${admin.email} has been approved as an administrator.`, 
        'success'
      );
      fetchAdmins();
    } catch (err: any) {
      showToast('Approve Failed', err.message || 'Failed to approve admin user.', 'error');
    }
  };

  // Handle Deny Admin Request (only for pending)
  const handleDeny = async (admin: AdminUserItem) => {
    try {
      await authService.updateAdminUser(admin.id, { is_approved: 2, is_active: false });
      showToast(
        'Admin Request Denied', 
        `Admin request for ${admin.email} has been denied.`, 
        'info'
      );
      fetchAdmins();
    } catch (err: any) {
      showToast('Deny Failed', err.message || 'Failed to deny admin user.', 'error');
    }
  };

  // Handle Block / Unblock Approved Admin
  const handleToggleBlock = async (admin: AdminUserItem) => {
    const nextBlocked = !admin.is_blocked;
    try {
      await authService.updateAdminUser(admin.id, { is_blocked: nextBlocked });
      showToast(
        nextBlocked ? 'Admin Blocked' : 'Admin Unblocked', 
        `${admin.email} has been ${nextBlocked ? 'blocked' : 'unblocked'}.`, 
        nextBlocked ? 'error' : 'success'
      );
      fetchAdmins();
    } catch (err: any) {
      showToast('Action Failed', err.message || 'Failed to update block state.', 'error');
    }
  };

  // Filtered Admins
  const filteredAdmins = admins.filter(a => 
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdmins = admins.length;
  const approvedAdmins = admins.filter(a => a.is_approved === 1 && !a.is_blocked).length;
  const pendingAdmins = admins.filter(a => a.is_approved === 0).length;
  const blockedAdmins = admins.filter(a => a.is_blocked).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#035352]/10 flex items-center justify-center text-[#035352] shrink-0 border border-[#035352]/20">
            <UserCog className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#172525] tracking-tight">Admin Approval & Access Control</h1>
            <p className="text-xs text-slate-500 font-medium">
              Super Admin Control Panel to approve, deny requests, and block/unblock administrator accounts.
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
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Active</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{approvedAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blocked Admins</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{blockedAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="max-w-md w-full">
            <Input
              placeholder="Search admin registrations by email..."
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
            <p className="text-sm font-semibold">Loading admin registrations...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No Admin Accounts Found</p>
            <p className="text-xs text-slate-400 mt-1">Admin registrations from the register page will appear here for approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Admin Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4">Block Status</th>
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

                      {/* Approval Status */}
                      <td className="py-4 px-4">
                        {admin.is_approved === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        ) : admin.is_approved === 2 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Denied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Approval
                          </span>
                        )}
                      </td>

                      {/* Block Status */}
                      <td className="py-4 px-4">
                        {admin.is_blocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            <Lock className="w-3.5 h-3.5 text-red-700" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Active / Normal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Case 1: Pending Approval (0) -> Can Approve or Deny */}
                          {admin.is_approved === 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(admin)}
                                title="Approve Admin Request"
                                className="px-3 py-1.5 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeny(admin)}
                                title="Deny Admin Request"
                                className="px-3 py-1.5 rounded-xl border border-rose-600 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Deny</span>
                              </button>
                            </>
                          )}

                          {/* Case 2: Denied (2) -> Can Approve */}
                          {admin.is_approved === 2 && (
                            <button
                              type="button"
                              onClick={() => handleApprove(admin)}
                              title="Approve Previously Denied Request"
                              className="px-3 py-1.5 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Request</span>
                            </button>
                          )}

                          {/* Case 3: Approved (1) -> Block / Unblock Toggle ONLY (No Deny!) */}
                          {admin.is_approved === 1 && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(admin)}
                              title={admin.is_blocked ? 'Unblock Admin' : 'Block Admin'}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                admin.is_blocked
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {admin.is_blocked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Unblock Admin</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Block Admin</span>
                                </>
                              )}
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
    </div>
  );
}

