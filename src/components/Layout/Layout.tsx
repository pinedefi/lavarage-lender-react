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
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps): JSX.Element => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Offers', href: '/offers', icon: TrendingUp },
    { name: 'Positions', href: '/positions', icon: Users },
    { name: 'Liquidations', href: '/liquidations', icon: AlertTriangle },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="card-glass px-4 py-2 flex items-center space-x-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`btn-glass ${
                  isActive ? 'bg-white/40' : ''
                } px-3 py-2 rounded-lg flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
          <div className="ml-2 pl-2 border-l border-white/20">
            <WalletMultiButton className="btn-glass !bg-transparent" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;