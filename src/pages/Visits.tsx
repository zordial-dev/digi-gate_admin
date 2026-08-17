import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, X, User, Building2, Calendar, Clock, FileText, UserCheck, UserX, Filter } from 'lucide-react';
import { adminVisitApi, organisationApi } from '@/api/services';
import type { VisitorVisit, Organisation } from '@/types';

export default function Visits() {
  const [visits, setVisits] = useState<VisitorVisit[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<VisitorVisit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 10;

  // Fetch organisations for filter
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

  // Fetch visits
  useEffect(() => {
    fetchVisits();
  }, [page, selectedOrg]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (selectedOrg) params.organisation_id = parseInt(selectedOrg);
      
      const res = await adminVisitApi.getAll(params);
      if (res.data.success) {
        setVisits(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (visit: VisitorVisit) => {
    setSelectedVisit(visit);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => setSelectedVisit(null), 300);
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading visits...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#06216B' }}>All Visits</h1>
        
        {/* Organisation Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: '#94a3b8' }} />
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-3 py-2 border rounded-xl outline-none transition-all text-sm"
            style={{
              borderColor: '#021767',
              color: '#3F5885',
              fontWeight: 500,
              backgroundColor: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#289CD8';
              e.target.style.boxShadow = '0 0 0 3px rgba(40, 156, 216, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#021767';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">All Organisations</option>
            {organisations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} {!org.is_active ? '(Inactive)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div 
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #021767',
          boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #021767' }}>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Visitor</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Host</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Organisation</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Purpose</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Date</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Status</th>
                <th className="text-center px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: '#94a3b8' }}>No visits found</td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.id} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>
                      {visit.visitor?.full_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>
                      {visit.host?.full_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>
                      {visit.organisation?.name || '-'}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" style={{ color: '#3F5885' }}>
                      {visit.purpose_of_visit}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>
                      {new Date(visit.check_in_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          backgroundColor: visit.host_available_at_submission ? '#dcfce7' : '#fee2e2',
                          color: visit.host_available_at_submission ? '#15803d' : '#dc2626'
                        }}
                      >
                        {visit.host_available_at_submission ? 'Completed' : 'Host Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openModal(visit)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#94a3b8' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#94a3b8';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
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

        {totalPages > 1 && (
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #021767', backgroundColor: '#f8fafc' }}
          >
            <div className="text-sm" style={{ color: '#64748b' }}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="p-2 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#021767',
                  color: '#3F5885',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (page !== 1) {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm font-semibold" style={{ color: '#3F5885' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#021767',
                  color: '#3F5885',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages) {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal with Zordial styling */}
      {showModal && selectedVisit && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              border: '1px solid #021767',
              boxShadow: '0 20px 60px rgba(2, 29, 91, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #021767' }}>
              <h2 className="text-xl font-bold" style={{ color: '#06216B' }}>Visit Details</h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: '#94a3b8' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3F5885';
                  e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                {selectedVisit.selfie_url ? (
                  <img 
                    src={selectedVisit.selfie_url} 
                    alt="Selfie" 
                    className="w-32 h-32 rounded-full object-cover border-4"
                    style={{ borderColor: '#021767' }}
                  />
                ) : (
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center border-4"
                    style={{ backgroundColor: '#f1f5f9', borderColor: '#021767' }}
                  >
                    <User className="h-12 w-12" style={{ color: '#94a3b8' }} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <User className="h-4 w-4" />
                    Visitor
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisit.visitor?.full_name || 'Unknown'}</p>
                  <p className="text-sm" style={{ color: '#3F5885' }}>{selectedVisit.visitor?.company || 'No company'}</p>
                  <p className="text-sm" style={{ color: '#3F5885' }}>{selectedVisit.visitor?.mobile_number || 'No mobile'}</p>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Building2 className="h-4 w-4" />
                    Host
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisit.host?.full_name || 'Unknown'}</p>
                  <p className="text-sm" style={{ color: '#3F5885' }}>{selectedVisit.host?.designation || 'No designation'}</p>
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                  <Building2 className="h-4 w-4" />
                  Organisation
                </div>
                <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisit.organisation?.name || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <FileText className="h-4 w-4" />
                    Purpose
                  </div>
                  <p style={{ color: '#0f172a' }}>{selectedVisit.purpose_of_visit}</p>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <FileText className="h-4 w-4" />
                    Reference
                  </div>
                  <p style={{ color: '#0f172a' }}>{selectedVisit.reference || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                  <p style={{ color: '#0f172a' }}>
                    {new Date(selectedVisit.check_in_time).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Clock className="h-4 w-4" />
                    Time
                  </div>
                  <p style={{ color: '#0f172a' }}>
                    {new Date(selectedVisit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                  {selectedVisit.host_available_at_submission ? (
                    <UserCheck className="h-4 w-4" style={{ color: '#15803d' }} />
                  ) : (
                    <UserX className="h-4 w-4" style={{ color: '#dc2626' }} />
                  )}
                  Status
                </div>
                <p className={`font-semibold ${
                  selectedVisit.host_available_at_submission ? 'text-green-700' : 'text-red-700'
                }`}>
                  {selectedVisit.host_available_at_submission ? 'Completed' : 'Host Unavailable'}
                </p>
                {selectedVisit.confirmation_message && (
                  <p className="text-sm mt-2" style={{ color: '#3F5885' }}>{selectedVisit.confirmation_message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end p-6" style={{ borderTop: '1px solid #021767' }}>
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-xl font-semibold transition-all"
                style={{
                  border: '1px solid #021767',
                  color: '#3F5885',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}