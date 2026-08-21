import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Eye, X, User, Building2, Mail, Phone, MapPin, Link as LinkIcon, Filter, Users } from 'lucide-react';
import { adminVisitorApi, organisationApi } from '@/api/services';
import type { Visitor, Organisation } from '@/types';

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 10;

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const res = await organisationApi.getAll({ limit: 100 });
        if (res.data.success) {
          setOrganisations(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch organisations:', error);
      }
    };
    fetchOrganisations();
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [page, search, selectedOrg]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (selectedOrg) params.organisation_id = parseInt(selectedOrg);
      
      const res = await adminVisitorApi.getAll(params);
      if (res.data.success) {
        setVisitors(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => setSelectedVisitor(null), 300);
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading && visitors.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-[#035352]">
          <div className="w-8 h-8 border-3 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading System Visitors Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#172525]">Global Visitors Master Directory</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Cross-tenant repository of all registered visitors across all organisations</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Org Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
            >
              <option value="">All Organisations</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} {!org.is_active ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search visitors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-60 px-4 py-2.5 pl-10 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Visitor Name</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Company</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Designation</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Mobile</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Organisation</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium text-xs">No registered visitors found</td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#172525]">{visitor.full_name}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{visitor.company || '-'}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{visitor.designation || '-'}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono font-medium">{visitor.mobile_number}</td>
                    <td className="px-5 py-3.5 font-bold text-[#035352]">{visitor.organisation?.name || '-'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => openModal(visitor)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-[#035352] hover:bg-[#035352]/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <div className="text-xs font-medium text-slate-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-xs font-bold text-[#035352]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedVisitor && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#172525]">Visitor Profile</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#035352]/10 border border-[#035352]/20 flex items-center justify-center text-[#035352]">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-black text-[#172525]">{selectedVisitor.full_name}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedVisitor.designation || 'No designation'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <Building2 className="h-3.5 w-3.5 text-[#035352]" />
                    Company
                  </div>
                  <p className="font-bold text-xs text-[#172525]">{selectedVisitor.company || 'N/A'}</p>
                </div>

                <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <Building2 className="h-3.5 w-3.5 text-[#035352]" />
                    Organisation
                  </div>
                  <p className="font-bold text-xs text-[#035352]">{selectedVisitor.organisation?.name || 'N/A'}</p>
                </div>

                <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <Phone className="h-3.5 w-3.5 text-[#035352]" />
                    Mobile
                  </div>
                  <p className="font-mono font-bold text-xs text-[#172525]">{selectedVisitor.mobile_number}</p>
                </div>

                <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <Mail className="h-3.5 w-3.5 text-[#035352]" />
                    Email
                  </div>
                  <p className="font-bold text-xs text-[#172525] truncate">{selectedVisitor.email || 'N/A'}</p>
                </div>

                <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-[#035352]" />
                    Location
                  </div>
                  <p className="font-bold text-xs text-[#172525]">{selectedVisitor.location || 'N/A'}</p>
                </div>

                <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    <LinkIcon className="h-3.5 w-3.5 text-[#035352]" />
                    LinkedIn Profile
                  </div>
                  <p className="font-bold text-xs text-[#172525]">
                    {selectedVisitor.linkedin ? (
                      <a href={selectedVisitor.linkedin} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                        {selectedVisitor.linkedin}
                      </a>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                Registered On: {new Date(selectedVisitor.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#035352] text-white hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}