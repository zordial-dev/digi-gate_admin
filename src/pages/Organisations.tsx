import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, Search, ChevronLeft, ChevronRight, Building2, Upload } from 'lucide-react';
import { organisationApi } from '@/api/services';
import type { Organisation } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function Organisations() {
  const navigate = useNavigate();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const limit = 10;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    timezone: '',
    host_available_message: '',
    host_unavailable_message: '',
  });

  useEffect(() => {
    fetchOrganisations();
  }, [page, search]);

  const fetchOrganisations = async () => {
    setLoading(true);
    try {
      const res = await organisationApi.getAll({ page, limit, search: search || undefined });
      if (res.data.success) {
        setOrganisations(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch organisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganisationDetails = async (id: number) => {
    try {
      const res = await organisationApi.getById(id);
      if (res.data.success) {
        return res.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch organisation details:', error);
      setMessage({ type: 'error', text: 'Failed to load organisation details' });
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      phone: '',
      email: '',
      website: '',
      timezone: '',
      host_available_message: '',
      host_unavailable_message: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
    setShowModal(true);
    setMessage(null);
  };

  const openEditModal = async (org: Organisation) => {
    setShowModal(true);
    setLoading(true);
    setMessage(null);
    
    try {
      const orgDetails = await fetchOrganisationDetails(org.id);
      
      if (orgDetails) {
        setEditingOrg(orgDetails);
        setFormData({
          name: orgDetails.name || '',
          code: orgDetails.code || '',
          address: orgDetails.address || '',
          city: orgDetails.city || '',
          state: orgDetails.state || '',
          country: orgDetails.country || '',
          pincode: orgDetails.pincode || '',
          phone: orgDetails.phone || '',
          email: orgDetails.email || '',
          website: orgDetails.website || '',
          timezone: orgDetails.timezone || '',
          host_available_message: orgDetails.host_available_message || '',
          host_unavailable_message: orgDetails.host_unavailable_message || '',
        });
        setLogoPreview(orgDetails.logo_url || null);
        setLogoFile(null);
      }
    } catch (error) {
      console.error('Error loading organisation details:', error);
      setMessage({ type: 'error', text: 'Failed to load organisation details' });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrg(null);
    setMessage(null);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof typeof formData]);
      });
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      let res;
      if (editingOrg) {
        res = await organisationApi.update(editingOrg.id, formDataToSend);
      } else {
        res = await organisationApi.create(formDataToSend);
      }

      if (res.data.success) {
        setMessage({ type: 'success', text: `Organisation ${editingOrg ? 'updated' : 'created'} successfully!` });
        await fetchOrganisations();
        setTimeout(closeModal, 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save organisation' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this organisation?')) return;
    try {
      const res = await organisationApi.delete(id);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Organisation deleted successfully!' });
        await fetchOrganisations();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete organisation' });
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await organisationApi.toggleStatus(id);
      if (res.data.success) {
        await fetchOrganisations();
        setMessage({ type: 'success', text: `Organisation ${currentStatus ? 'deactivated' : 'activated'}!` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading && organisations.length === 0) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading organisations...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#06216B' }}>Organisations</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)',
            boxShadow: '0 6px 18px rgba(2, 29, 91, 0.2)',
            border: '1px solid #021767'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #06216B 0%, #021D5B 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)';
          }}
        >
          <Plus className="h-4 w-4" />
          Add Organisation
        </button>
      </div>

      {message && (
        <div 
          className={`mb-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search organisations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
          <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
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
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Logo</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Name</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Code</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>City</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Status</th>
                <th className="text-center px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organisations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: '#94a3b8' }}>No organisations found</td>
                </tr>
              ) : (
                organisations.map((org) => (
                  <tr key={org.id} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                    <td className="px-4 py-3">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                          <Building2 className="h-5 w-5" style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>{org.name}</td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>{org.code}</td>
                    <td className="px-4 py-3" style={{ color: '#64748b' }}>{org.city || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(org.id, org.is_active)}
                        className="text-xs px-2 py-1 rounded-full font-semibold transition-all"
                        style={{
                          backgroundColor: org.is_active ? '#dcfce7' : '#fee2e2',
                          color: org.is_active ? '#15803d' : '#dc2626'
                        }}
                      >
                        {org.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/organisations/${org.id}`)}
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
                        <button
                          onClick={() => openEditModal(org)}
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
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#94a3b8' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Create/Edit Modal with Zordial styling */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            style={{
              border: '1px solid #021767',
              boxShadow: '0 20px 60px rgba(2, 29, 91, 0.25)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#06216B' }}>
                {editingOrg ? 'Edit Organisation' : 'Add New Organisation'}
              </h2>
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

            {loading && editingOrg ? (
              <div className="text-center py-8" style={{ color: '#64748b' }}>Loading organisation details...</div>
            ) : (
              <>
                {message && (
                  <div 
                    className={`mb-4 p-3 rounded-lg border ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Logo</label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: '#f1f5f9', border: '1px solid #021767' }}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8" style={{ color: '#94a3b8' }} />
                        )}
                      </div>
                      <label 
                        className="cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all"
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
                        <Upload className="h-4 w-4 inline mr-2" />
                        Upload Logo
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Organisation Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Code *</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Timezone</label>
                      <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
                      >
                        <option value="">Select timezone</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="America/Chicago">America/Chicago</option>
                        <option value="America/Denver">America/Denver</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Asia/Dubai">Asia/Dubai</option>
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="Asia/Singapore">Asia/Singapore</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                      </select>
                    </div>
                  </div>

                  {/* Host Message Fields */}
                  <div className="border-t pt-4 mt-2" style={{ borderColor: '#e2e8f0' }}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: '#3F5885' }}>Host Messages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Available Message</label>
                        <textarea
                          name="host_available_message"
                          value={formData.host_available_message}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Message to show when host is available"
                          className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all resize-y"
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
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Unavailable Message</label>
                        <textarea
                          name="host_unavailable_message"
                          value={formData.host_unavailable_message}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Message to show when host is unavailable"
                          className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all resize-y"
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
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2.5 rounded-xl font-semibold transition-all"
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
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)',
                        boxShadow: '0 6px 18px rgba(2, 29, 91, 0.2)',
                        border: '1px solid #021767'
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #06216B 0%, #021D5B 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)';
                        }
                      }}
                    >
                      {submitting ? 'Saving...' : editingOrg ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}