import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users,
  ClipboardList,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/org', label: 'Organisations', icon: Building2 },
  { path: '/visitors', label: 'Visitors', icon: Users },
  { path: '/visits', label: 'Visits', icon: ClipboardList },
];

export default function Sidebar() {
  return (
    <aside 
      className="w-64 min-h-screen p-4 flex flex-col"
      style={{
        backgroundColor: '#ffffff',
        borderRight: '1px solid #021767',
        boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
      }}
    >
      {/* Logo Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#eff6ff' }}
          >
            <Building2 className="h-5 w-5" style={{ color: '#06216B' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#289CD8' }}>
              DigiGate
            </h1>
            <p className="text-xs" style={{ color: '#3F5885', fontWeight: 600 }}>
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-blue-50'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#06216B' : 'transparent',
                color: isActive ? '#FFC921' : '#3F5885',
                border: isActive ? '1px solid #021767' : 'none',
                boxShadow: isActive ? '0 6px 18px rgba(2, 29, 91, 0.2)' : 'none'
              })}
            >
              <Icon className="h-5 w-5" style={{ 
                color: location.pathname === item.path ? '#FFC921' : '#64748b' 
              }} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section - Admin Profile & Logout */}
      <div className="pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#06216B' }}
          >
            A
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              Admin
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              admin@zordial.tech
            </p>
          </div>
        </div>
        
        <button 
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full mt-1"
          style={{
            color: '#ef4444',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => {
            // Add your logout logic here
            console.log('Logout clicked');
          }}
        >
          <LogOut className="h-5 w-5" style={{ color: '#ef4444' }} />
          Logout
        </button>
      </div>
    </aside>
  );
}