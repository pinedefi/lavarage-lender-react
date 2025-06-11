import React from 'react';
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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Offers', href: '/offers', icon: TrendingUp },
    { name: 'Positions', href: '/positions', icon: Users },
    { name: 'Liquidations', href: '/liquidations', icon: AlertTriangle },
    { name: 'Create Offer', href: '/create-offer', icon: PlusCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-red-950">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-red-800 dark:bg-red-900">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="self-center text-xl font-semibold dark:text-white">
                  Leverage Lender
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <WalletMultiButton className="!bg-primary-600 !rounded-md hover:!bg-primary-700" />
            </div>
          </div>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-40 mt-16 h-screen w-64 border-r border-gray-200 bg-white pt-6 transition-transform dark:border-red-800 dark:bg-red-900">
        <div className="h-full overflow-y-auto px-3 pb-4">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-red-800 ${
                      isActive ? 'bg-gray-100 dark:bg-red-800' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-500 transition duration-75 dark:text-red-300" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="mt-16 p-4 sm:ml-64">
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-red-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;