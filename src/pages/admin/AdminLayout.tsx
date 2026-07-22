import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ListTodo, 
  Clock, 
  CalendarOff, 
  Settings,
  LogOut,
  MapPin
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/admin/services', icon: ListTodo, label: 'Services' },
  { to: '/admin/hours', icon: Clock, label: 'Business Hours' },
  { to: '/admin/blocked-dates', icon: CalendarOff, label: 'Blocked Dates' },
  { to: '/admin/settings', icon: Settings, label: 'Turf Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-turf-900 flex text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-turf-800 border-r border-turf-700 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-turf-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-turf-green/10 flex items-center justify-center text-turf-green border border-turf-green/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white leading-tight">Admin</h1>
              <p className="text-xs text-slate-400 font-medium">Turf Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-turf-green/10 text-turf-green shadow-[inset_0_0_0_1px_rgba(0,255,135,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-turf-700/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-turf-700">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto relative h-screen">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-turf-800 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
