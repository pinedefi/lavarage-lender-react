import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@/contexts/WalletContext';
import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress } from '@/utils';
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  TrendingUp,
  BarChart3,
  Coins,
  Wallet,
  DollarSign,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'My Offers', href: '/offers', icon: Coins },
    { name: 'Positions', href: '/positions', icon: TrendingUp },
    { name: 'Liquidations', href: '/liquidations', icon: Wallet },
    { name: 'Balances', href: '/balances', icon: DollarSign },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  Lavarage
                </span>
                <Badge variant="primary" size="sm" className="ml-2">
                  Lender
                </Badge>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-10 space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive(item.href)
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Wallet and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-400 ring-2 ring-white"></span>
            </button>

            {/* Wallet Connection */}
            {connected && publicKey ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Address Display */}
                <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="h-2 w-2 bg-success-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {truncateAddress(publicKey.toBase58())}
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  </button>
                </div>

                {/* Settings */}
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Settings className="h-5 w-5" />
                </button>

                {/* Disconnect */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <WalletMultiButton className="!bg-primary-600 !rounded-md hover:!bg-primary-700" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="px-2 py-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;