import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Eye, X, User, Building2, Mail, Phone, MapPin, Link, Filter } from 'lucide-react';
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

  // Fetch visitors
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

  if (loading) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading visitors...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#06216B' }}>All Visitors</h1>
        
        <div className="flex items-center gap-3 flex-wrap">
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

          {/* Search */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search visitors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-xl outline-none transition-all w-48 pr-10"
              style={{
                borderColor: '#021767',
                color: '#3F5885',
                fontWeight: 500,
                fontSize: '0.95rem',
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
            />
            <Search className="h-5 w-5 absolute right-3" style={{ color: '#94a3b8' }} />
          </div>
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
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Name</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Company</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Designation</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Mobile</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Organisation</th>
                <th className="text-center px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: '#94a3b8' }}>No visitors found</td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>{visitor.full_name}</td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>{visitor.company || '-'}</td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>{visitor.designation || '-'}</td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>{visitor.mobile_number}</td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>{visitor.organisation?.name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openModal(visitor)}
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
      {showModal && selectedVisitor && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{
              border: '1px solid #021767',
              boxShadow: '0 20px 60px rgba(2, 29, 91, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #021767' }}>
              <h2 className="text-xl font-bold" style={{ color: '#06216B' }}>Visitor Details</h2>
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

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#f1f5f9' }}
                >
                  <User className="h-8 w-8" style={{ color: '#94a3b8' }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>{selectedVisitor.full_name}</p>
                  <p style={{ color: '#64748b' }}>{selectedVisitor.designation || 'No designation'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Building2 className="h-4 w-4" />
                    Company
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisitor.company || 'N/A'}</p>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Building2 className="h-4 w-4" />
                    Organisation
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisitor.organisation?.name || 'N/A'}</p>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Phone className="h-4 w-4" />
                    Mobile
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisitor.mobile_number}</p>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisitor.email || 'N/A'}</p>
                </div>

                <div className="rounded-lg p-4 md:col-span-2" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <p className="font-semibold" style={{ color: '#0f172a' }}>{selectedVisitor.location || 'N/A'}</p>
                </div>

                <div className="rounded-lg p-4 md:col-span-2" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
                    <Link className="h-4 w-4" />
                    LinkedIn
                  </div>
                  <p className="font-semibold">
                    {selectedVisitor.linkedin ? (
                      <a href={selectedVisitor.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#2563eb' }}>
                        {selectedVisitor.linkedin}
                      </a>
                    ) : (
                      <span style={{ color: '#64748b' }}>N/A</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-sm" style={{ color: '#94a3b8' }}>
                Joined: {new Date(selectedVisitor.created_at).toLocaleDateString()}
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