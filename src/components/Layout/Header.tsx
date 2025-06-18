import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@/contexts/WalletContext';
import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress } from '@/utils';
import {
  Menu,
  X,
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
import { LavarageLogo } from '@/components/brand';

interface HeaderProps {
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, mobileMenuOpen = false }) => {
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
    <header className="lavarage-header sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-lavarage-coral hover:bg-lavarage-subtle focus:outline-none focus:ring-2 focus:ring-lavarage-coral transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* LAVARAGE Logo */}
            <Link to="/" className="flex items-center group">
              <div className="flex-shrink-0 flex items-center transition-transform duration-300 group-hover:scale-105">
                <LavarageLogo
                  variant="horizontal"
                  size="lg"
                  priority={true}
                  className="transition-all duration-300"
                />
                <Badge variant="primary" size="sm" className="ml-3 badge-lavarage shadow-md">
                  Lender
                </Badge>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-10 space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-all duration-300 ${
                      active
                        ? 'nav-link-active'
                        : 'border-transparent text-gray-500 hover:text-lavarage-coral hover:border-lavarage-orange/50'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mr-2 transition-colors duration-300 ${
                        active ? 'text-lavarage-red' : ''
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Wallet and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {/* <button className="p-2 text-gray-400 hover:text-lavarage-coral relative transition-colors duration-300 group" aria-label="Notifications">
              <Bell className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="notification-dot absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white"></span>
            </button> */}

            {/* Wallet Connection */}
            {connected && publicKey ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Address Display */}
                <div className="hidden sm:flex items-center space-x-2 glass-lavarage rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-lg">
                  <div className="status-connected h-2 w-2 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {truncateAddress(publicKey.toBase58())}
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavarage-coral transition-all duration-300 group">
                    <div className="h-8 w-8 bg-lavarage-primary rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </button>
                </div>

                {/* Settings */}
                <button
                  className="p-2 text-gray-400 hover:text-lavarage-coral transition-colors duration-300 group"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Disconnect */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  aria-label="Disconnect wallet"
                  className="text-gray-500 hover:text-lavarage-red hover:bg-lavarage-subtle transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <WalletMultiButton className="btn-lavarage !text-white !font-bold !shadow-lg hover:!shadow-xl !transition-all !duration-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-lavarage-orange/10 bg-gradient-to-r from-lavarage-subtle to-transparent animate-in slide-in-from-top-2 duration-200">
          <div className="px-2 py-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onMenuToggle} // Close menu when link is clicked
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-lavarage-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-lavarage-red hover:bg-lavarage-subtle'
                  }`}
                  aria-label="Open navigation menu"
                >
                  <Icon
                    className={`h-5 w-5 mr-3 transition-colors duration-300 ${
                      active ? 'text-white' : ''
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
