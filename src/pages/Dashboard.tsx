import { useState, useEffect } from 'react';
import { Building2, Users, ClipboardList, Activity } from 'lucide-react';
import { adminDashboardApi } from '@/api/services';
import type { DashboardStats, Organisation } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrgs, setRecentOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          adminDashboardApi.getStats(),
          adminDashboardApi.getRecentOrganisations(5),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (recentRes.data.success) setRecentOrgs(recentRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8" style={{ color: '#64748b' }}>
        Loading...
      </div>
    );
  }

  const statItems = [
    { title: 'Total Organisations', value: stats?.total_organisations || 0, icon: Building2, color: '#06216B' },
    { title: 'Total Visitors', value: stats?.total_visitors || 0, icon: Users, color: '#15803d' },
    { title: 'Total Visits', value: stats?.total_visits || 0, icon: ClipboardList, color: '#7c3aed' },
    { title: 'Active Organisations', value: stats?.active_organisations || 0, icon: Activity, color: '#c2410c' },
  ];

  return (
    <div>
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: '#06216B' }}
      >
        Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems.map((stat) => (
          <div 
            key={stat.title} 
            className="rounded-xl p-6 transition-all hover:shadow-lg"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #021767',
              boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#3F5885' }}>
                  {stat.title}
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: '#0f172a' }}
                >
                  {stat.value}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div 
        className="rounded-xl p-6"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #021767',
          boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
        }}
      >
        <h3 
          className="text-lg font-bold mb-4"
          style={{ color: '#0f172a' }}
        >
          Recent Organisations
        </h3>
        {recentOrgs.length === 0 ? (
          <p className="text-center py-4" style={{ color: '#94a3b8' }}>
            No organisations found
          </p>
        ) : (
          <div className="space-y-3">
            {recentOrgs.map((org) => (
              <div 
                key={org.id} 
                className="flex items-center justify-between py-3"
                style={{ borderBottom: '1px solid #f1f5f9' }}
              >
                <div className="flex items-center gap-3">
                  {org.logo_url ? (
                    <img 
                      src={org.logo_url} 
                      alt={org.name} 
                      className="w-10 h-10 rounded-lg object-cover"
                      style={{ border: '1px solid #e2e8f0' }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#f1f5f9' }}
                    >
                      <Building2 className="h-5 w-5" style={{ color: '#94a3b8' }} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: '#0f172a' }}>
                      {org.name}
                    </p>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      {org.code}
                    </p>
                  </div>
                </div>
                <span 
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    backgroundColor: org.is_active ? '#dcfce7' : '#fee2e2',
                    color: org.is_active ? '#15803d' : '#dc2626'
                  }}
                >
                  {org.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}