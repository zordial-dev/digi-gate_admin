import { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  MessageSquare,
} from 'lucide-react';
import { registrationRequestApi } from '@/api/services';
import type { Organisation } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function RegistrationRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'hold' | 'denied'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal States for Hold and Deny
  const [actionModal, setActionModal] = useState<{
    type: 'hold' | 'deny' | null;
    org: Organisation | null;
  }>({ type: null, org: null });

  const [actionMessage, setActionMessage] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchRequests();
  }, [page, search, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await registrationRequestApi.getAll({
        page,
        limit,
        search: search || undefined,
        status: statusFilter,
      });
      if (res.data.success) {
        setRequests(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch registration requests:', error);
      showToast('Failed to load registration requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (org: Organisation) => {
    if (!window.confirm(`Are you sure you want to APPROVE ${org.name}? This will activate the organisation.`)) {
      return;
    }

    try {
      const res = await registrationRequestApi.approve(org.id);
      if (res.data.success) {
        showToast(`${org.name} has been approved successfully!`, 'success');
        fetchRequests();
      }
    } catch (error: any) {
      console.error('Approve error:', error);
      showToast(error.response?.data?.error || 'Failed to approve request', 'error');
    }
  };

  const openActionModal = (type: 'hold' | 'deny', org: Organisation) => {
    setActionModal({ type, org });
    setActionMessage(org.block_reason || '');
  };

  const closeActionModal = () => {
    setActionModal({ type: null, org: null });
    setActionMessage('');
    setSubmittingAction(false);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.org || !actionModal.type) return;

    if (!actionMessage.trim()) {
      showToast(`Please enter a message for putting this request on ${actionModal.type}`, 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      let res;
      if (actionModal.type === 'hold') {
        res = await registrationRequestApi.hold(actionModal.org.id, actionMessage.trim());
      } else {
        res = await registrationRequestApi.deny(actionModal.org.id, actionMessage.trim());
      }

      if (res.data.success) {
        showToast(
          actionModal.type === 'hold'
            ? `${actionModal.org.name} has been put on hold.`
            : `${actionModal.org.name} registration request has been denied.`,
          'success'
        );
        closeActionModal();
        fetchRequests();
      }
    } catch (error: any) {
      console.error('Action error:', error);
      showToast(error.response?.data?.error || 'Failed to update request status', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (org: Organisation) => {
    const isApproved = org.is_approved ?? 0;
    if (isApproved === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Pending Approval
        </span>
      );
    }
    if (isApproved === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <PauseCircle className="w-3.5 h-3.5" /> On Hold
        </span>
      );
    }
    if (isApproved === 3) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" /> Denied
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" /> Approved
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#035352]/10 text-[#035352]">
              <FileCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Registration Requests
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 font-medium ml-10">
            Review, approve, hold, or deny organisation business registrations.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start md:self-auto">
          {(['all', 'pending', 'hold', 'denied'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white text-[#035352] shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Requests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search requests by organisation name, city, phone, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#035352]/20 focus:border-[#035352] transition-all"
        />
      </div>

      {/* Requests List Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="h-8 w-8 text-[#035352] animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Registration Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No requests matched your search term.'
              : statusFilter !== 'all'
              ? `There are currently no requests with "${statusFilter}" status.`
              : 'There are no pending business registration requests at this time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((org) => {
            const isApproved = org.is_approved ?? 0;
            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-black text-lg border border-[#035352]/20">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{org.name}</h3>
                        <span className="text-xs font-mono font-semibold text-slate-400">#{org.id}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted: {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(org)}</div>
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Location</p>
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {[org.address, org.city, org.state, org.country, org.pincode].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Contact Info</p>
                    <div className="space-y-1 text-slate-700">
                      {org.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{org.phone}</span>
                        </div>
                      )}
                      {org.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{org.email}</span>
                        </div>
                      )}
                      {!org.phone && !org.email && <span>No contact info provided</span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Website & System</p>
                    <div className="space-y-1 text-slate-700">
                      {org.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#035352] hover:underline truncate"
                          >
                            {org.website}
                          </a>
                        </div>
                      )}
                      <p className="text-slate-500">Timezone: {org.timezone || 'Asia/Kolkata'}</p>
                    </div>
                  </div>
                </div>

                {/* Block / Hold / Deny Message Callout */}
                {org.block_reason && (
                  <div
                    className={`rounded-xl p-3.5 text-xs border ${
                      isApproved === 2
                        ? 'bg-purple-50 border-purple-200 text-purple-900'
                        : isApproved === 3
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {isApproved === 2 ? 'Hold Message / Reason:' : isApproved === 3 ? 'Deny Reason:' : 'Note:'}
                        </span>{' '}
                        <span>{org.block_reason}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {/* Approve Button */}
                  <button
                    onClick={() => handleApprove(org)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>

                  {/* Hold Button */}
                  <button
                    onClick={() => openActionModal('hold', org)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
                  >
                    <PauseCircle className="w-4 h-4" /> {isApproved === 2 ? 'Update Hold Message' : 'Put On Hold'}
                  </button>

                  {/* Deny Button */}
                  <button
                    onClick={() => openActionModal('deny', org)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                  >
                    <XCircle className="w-4 h-4" /> {isApproved === 3 ? 'Update Deny Reason' : 'Deny Request'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-medium text-slate-500">
          <span>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} requests
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Modal (Hold / Deny Message Dialog) */}
      {actionModal.type && actionModal.org && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {actionModal.type === 'hold' ? (
                  <PauseCircle className="w-5 h-5 text-purple-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {actionModal.type === 'hold' ? 'Put Registration On Hold' : 'Deny Registration Request'}
                </h3>
              </div>
              <button onClick={closeActionModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Organisation: <span className="font-bold text-slate-900">{actionModal.org.name}</span>
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {actionModal.type === 'hold' ? 'Hold Message / Reason' : 'Deny Reason Message'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    actionModal.type === 'hold'
                      ? 'e.g. Additional documentation required. Please provide proof of business registration.'
                      : 'e.g. Application details could not be verified.'
                  }
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#035352]/20 focus:border-[#035352]"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  This message will be recorded on the request status.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={submittingAction}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 ${
                    actionModal.type === 'hold'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{actionModal.type === 'hold' ? 'Confirm Hold' : 'Confirm Deny'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
