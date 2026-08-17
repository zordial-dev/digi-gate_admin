import { useState, useEffect } from 'react';
import { Building2, Users, ClipboardList, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { adminDashboardApi } from '@/api/services';
import type { DashboardStats, Organisation } from '@/types';
import { Link } from 'react-router-dom';

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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#035352]">Loading Admin Telemetry...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    { title: 'Total Organisations', value: stats?.total_organisations || 0, icon: Building2, color: 'bg-[#035352]' },
    { title: 'Active Organisations', value: stats?.active_organisations || 0, icon: Activity, color: 'bg-emerald-600' },
    { title: 'Registered Visitors', value: stats?.total_visitors || 0, icon: Users, color: 'bg-teal-600' },
    { title: 'Total Visit Logs', value: stats?.total_visits || 0, icon: ClipboardList, color: 'bg-cyan-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#035352] via-[#05706f] to-[#023e3d] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-[#035352]/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-[#F3E8BC]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F3E8BC] text-xs font-semibold backdrop-blur-md mb-3 border border-[#F3E8BC]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Command Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Administrator Control Center
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Monitor gate entries, organisation registrations, and system access telemetry.
            </p>
          </div>
          <Link
            to="/org"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F3E8BC] text-[#172525] font-bold text-xs hover:bg-[#e8da9d] transition-all shadow-md shrink-0 border border-[#e5d59e]"
          >
            <span>Manage Organisations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statItems.map((stat) => (
          <div 
            key={stat.title} 
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-[#172525] mt-2 group-hover:text-[#035352] transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-lg shadow-[#035352]/20 shrink-0`}>
                <stat.icon className="h-6 w-6 stroke-[2.2]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Organisations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172525]">Recent Organisations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest registered tenants in the system</p>
          </div>
          <Link to="/org" className="text-xs font-extrabold text-[#035352] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrgs.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-slate-400">
            No recent organisations found
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrgs.map((org) => (
              <div 
                key={org.id} 
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  {org.logo_url ? (
                    <img 
                      src={org.logo_url} 
                      alt={org.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#035352]/10 border border-[#035352]/20 flex items-center justify-center text-[#035352]">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-[#172525]">{org.name}</p>
                    <p className="text-xs text-slate-500 font-mono font-medium">{org.code}</p>
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full font-extrabold border ${
                  org.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {org.is_active ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}