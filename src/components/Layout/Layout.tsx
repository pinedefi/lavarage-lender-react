import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  AlertTriangle,
  PlusCircle,
  BarChart2,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { connected, connect, disconnect } = useWallet();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Offers', href: '/offers', icon: TrendingUp },
    { name: 'Positions', href: '/positions', icon: Users },
    { name: 'Liquidations', href: '/liquidations', icon: AlertTriangle },
    { name: 'Create Offer', href: '/create-offer', icon: PlusCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
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
              <Button
                onClick={connected ? disconnect : connect}
                variant={connected ? 'outline' : 'primary'}
                className="flex items-center"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {connected ? 'Disconnect' : 'Connect Wallet'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-40 mt-16 h-screen w-64 border-r border-gray-200 bg-white pt-6 transition-transform dark:border-gray-700 dark:bg-gray-800">
        <div className="h-full overflow-y-auto px-3 pb-4">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                      isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="mt-16 p-4 sm:ml-64">
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;