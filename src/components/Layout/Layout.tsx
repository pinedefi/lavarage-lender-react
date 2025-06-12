import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@/contexts/WalletContext';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  AlertTriangle,
  PlusCircle,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps): JSX.Element => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Offers', href: '/offers', icon: TrendingUp },
    { name: 'Positions', href: '/positions', icon: Users },
    { name: 'Liquidations', href: '/liquidations', icon: AlertTriangle },
    { name: 'Create Offer', href: '/create-offer', icon: PlusCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`card-glass fixed top-4 bottom-4 left-4 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && <h1 className="text-xl font-bold">Leverage Lender</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <WalletMultiButton className="btn-glass w-full !bg-transparent" />
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-24' : 'ml-72'} p-4`}>
        <div className="card-glass min-h-[calc(100vh-2rem)] p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;