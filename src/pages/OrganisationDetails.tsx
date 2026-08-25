import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, ChevronLeft, QrCode, Phone, Mail, Globe, MapPin, 
  Clock, MessageSquare, Users, ClipboardList, ShieldCheck, ShieldAlert, Edit2, User, RefreshCw
} from 'lucide-react';
import { organisationApi, adminVisitApi } from '@/api/services';
import type { Organisation, VisitorVisit } from '@/types';
import OrgQRModal from '../components/UI/OrgQRModal';
import apiClient from '../api/client';

export default function OrganisationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [org, setOrg] = useState<Organisation | null>(null);
  const [hosts, setHosts] = useState<any[]>([]);
  const [visits, setVisits] = useState<VisitorVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hosts' | 'visits'>('overview');
  const [showQRModal, setShowQRModal] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrganisationDetails(parseInt(id));
    }
  }, [id]);

  const fetchOrganisationDetails = async (orgId: number) => {
    setLoading(true);
    try {
      // 1. Fetch Organisation Details
      const orgRes = await organisationApi.getById(orgId);
      if (orgRes.data.success) {
        setOrg(orgRes.data.data);
      }

      // 2. Fetch Hosts for this Organisation
      try {
        const hostsRes = await apiClient.get(`/admin/organisations/${orgId}/hosts`);
        if (hostsRes.data.success) {
          setHosts(hostsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch org hosts:', err);
      }

      // 3. Fetch Visits for this Organisation
      try {
        const visitsRes = await adminVisitApi.getAll({ organisation_id: orgId, limit: 15 });
        if (visitsRes.data.success) {
          setVisits(visitsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch org visits:', err);
      }
    } catch (error) {
      console.error('Failed to load organisation details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!org) return;
    setStatusToggling(true);
    try {
      const res = await organisationApi.toggleStatus(org.id);
      if (res.data.success) {
        setOrg(res.data.data);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setStatusToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-[#035352]">
          <div className="w-10 h-10 border-4 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-extrabold uppercase tracking-wider">Loading Organisation Details...</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-800">Organisation Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The requested organisation record could not be loaded or was removed.</p>
        <button
          onClick={() => navigate('/org')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#035352] text-white hover:bg-[#023e3d] transition-all"
        >
          Return to Organisations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/org')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#035352] transition-colors group mb-1"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Organisations
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[#172525] tracking-tight">{org.name}</h1>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              #{org.code}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
              org.is_active 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {org.is_active ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              {org.is_active ? 'Approved & Active' : 'Pending Approval'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#035352] text-white hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Entry Pass</span>
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={statusToggling}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${
              org.is_active 
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statusToggling ? 'animate-spin' : ''}`} />
            <span>{org.is_active ? 'Deactivate Gate' : 'Approve & Activate'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Staff Hosts</p>
            <p className="text-xl font-black text-[#172525]">{hosts.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold shrink-0">
            <ClipboardList className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Visits</p>
            <p className="text-xl font-black text-[#172525]">{visits.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timezone</p>
            <p className="text-xs font-bold text-[#172525] truncate">{org.timezone || 'Asia/Kolkata'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant Code</p>
            <p className="text-sm font-bold font-mono text-[#035352] truncate">{org.code}</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200/80 flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-bold text-xs transition-all relative ${
            activeTab === 'overview'
              ? 'text-[#035352]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Organisation Profile & Settings</span>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#035352] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('hosts')}
          className={`pb-3 px-4 font-bold text-xs transition-all relative flex items-center gap-1.5 ${
            activeTab === 'hosts'
              ? 'text-[#035352]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Staff Hosts ({hosts.length})</span>
          {activeTab === 'hosts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#035352] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`pb-3 px-4 font-bold text-xs transition-all relative flex items-center gap-1.5 ${
            activeTab === 'visits'
              ? 'text-[#035352]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Visit History ({visits.length})</span>
          {activeTab === 'visits' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#035352] rounded-t-full" />
          )}
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Information Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 space-y-6">
              <div className="flex items-center gap-4">
                {org.logo_url ? (
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#035352]/20 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#035352]/10 text-[#035352] border border-[#035352]/20 flex items-center justify-center font-bold">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-[#172525]">{org.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{org.city ? `${org.city}, ${org.state || ''} ${org.country || ''}` : 'Location not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <Mail className="w-4 h-4 text-[#035352] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Email</p>
                    <p className="text-xs font-bold text-slate-800 break-all">{org.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <Phone className="w-4 h-4 text-[#035352] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-xs font-bold font-mono text-slate-800">{org.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <Globe className="w-4 h-4 text-[#035352] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website URL</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{org.website || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <MapPin className="w-4 h-4 text-[#035352] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pincode / Postal</p>
                    <p className="text-xs font-bold text-slate-800">{org.pincode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {org.address && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Address</p>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{org.address}</p>
                </div>
              )}
            </div>

            {/* Custom Messages Settings */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquare className="w-5 h-5 text-[#035352]" />
                <h3 className="text-base font-extrabold text-[#172525]">Automated Gate Messages</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Host Available Notification Message
                  </span>
                  <p className="text-xs font-medium text-emerald-950 leading-relaxed bg-white p-3 rounded-xl border border-emerald-200/50">
                    {org.host_available_message || 'Thank you for visiting! {visitor_name}, {host_name} will be with you shortly.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                    Host Unavailable Notification Message
                  </span>
                  <p className="text-xs font-medium text-rose-950 leading-relaxed bg-white p-3 rounded-xl border border-rose-200/50">
                    {org.host_unavailable_message || 'Thank you for your interest, {visitor_name}. {host_name} is currently unavailable.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side QR Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#035352] to-[#023e3d] rounded-3xl text-white p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Visitor Check-In Pass</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30">
                  Live Gate
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner text-slate-800 space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `http://localhost:5173/?org=${org.code}`
                  )}`}
                  alt="Org QR Code"
                  className="w-40 h-40 object-contain rounded-xl"
                />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scan to Check-In</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Tenant Code:</span>
                  <span className="font-bold font-mono text-white">{org.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Check-In URL:</span>
                  <span className="font-bold font-mono text-emerald-300 truncate max-w-[180px]">
                    http://localhost:5173/?org={org.code}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowQRModal(true)}
                className="w-full py-3 rounded-2xl font-extrabold text-xs bg-white text-[#035352] hover:bg-slate-100 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Open & Print QR Poster</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: HOSTS */}
      {activeTab === 'hosts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
          {hosts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-xs">
              No staff hosts registered for this organisation.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {hosts.map((host) => (
                <div key={host.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {host.profile_pic ? (
                      <img
                        src={host.profile_pic}
                        alt={host.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#035352] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#035352]/10 text-[#035352] border border-[#035352]/20 flex items-center justify-center font-bold shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#172525] truncate">{host.full_name}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {host.designation || 'Staff Member'} {host.department ? `• ${host.department}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="font-mono text-slate-600 hidden sm:inline">{host.email}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${
                      host.is_available ?? true
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {host.is_available ?? true ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VISITS */}
      {activeTab === 'visits' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
          {visits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-xs">
              No recent visit logs found for this organisation.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visits.map((visit) => (
                <div key={visit.id} className="p-4 sm:p-5 space-y-2 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#172525]">
                        {visit.visitor?.full_name || 'Visitor'}
                      </h4>
                      <p className="text-xs text-[#035352] font-bold">
                        Host: {visit.host?.full_name || 'Staff'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                      visit.host_available_at_submission
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {visit.host_available_at_submission ? 'Completed' : 'Host Unavailable'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 font-medium">
                    "{visit.purpose_of_visit}"
                  </p>

                  <p className="text-[11px] text-slate-400 font-mono">
                    Check-in: {new Date(visit.check_in_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <OrgQRModal org={org} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
}
