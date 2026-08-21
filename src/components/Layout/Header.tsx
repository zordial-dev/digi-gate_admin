import { ShieldCheck, Bell, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || 'Admin User';

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#035352] uppercase tracking-wider bg-[#035352]/10 px-3 py-1.5 rounded-full border border-[#035352]/20">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
          <span>System Online</span>
        </div>
        <span className="text-slate-300">|</span>
        <p className="text-xs font-semibold text-slate-500">
          Welcome back, <span className="text-[#172525] font-bold">{displayName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-[#035352]" />
          <span>Admin Portal</span>
        </div>
        <button 
          className="p-2 rounded-xl text-slate-400 hover:text-[#035352] hover:bg-slate-100 transition-all relative"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}