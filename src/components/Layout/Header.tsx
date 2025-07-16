import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
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
  const { publicKey, connected, disconnect, connect } = useWallet();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Offers', href: '/offers', icon: Coins },
    { name: 'Balances', href: '/balances', icon: DollarSign },
    { name: 'Positions', href: '/positions', icon: TrendingUp },
    { name: 'Liquidations', href: '/liquidations', icon: Wallet }, 
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleMobileWalletClick = async () => {
    try {
      if (connected) {
        await disconnect();
      } else {
        // For mobile, we'll trigger the same wallet connection as the desktop button
        // We use a more reliable approach by finding the actual WalletMultiButton
        const walletButton = document.querySelector('.wallet-adapter-button') as HTMLButtonElement;
        if (walletButton) {
          walletButton.click();
        } else {
          // Fallback to connect method
          await connect();
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <header className="lavarage-header sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-lavarage-coral hover:bg-lavarage-subtle focus:outline-none focus:ring-2 focus:ring-lavarage-coral transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* LAVARAGE Logo */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <div className="flex items-center transition-transform duration-300 group-hover:scale-105">
                <LavarageLogo
                  variant="horizontal"
                  size="lg"
                  priority={true}
                  className="transition-all duration-300"
                />
                <Badge variant="primary" size="sm" className="ml-2 lg:ml-3 badge-lavarage shadow-md">
                  Lender
                </Badge>
              </div>
            </Link>

            {/* Desktop/Tablet Navigation */}
            <nav className="hidden lg:flex ml-6 xl:ml-10 space-x-4 xl:space-x-8 flex-1 justify-center max-w-2xl">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${
                      active
                        ? 'nav-link-active'
                        : 'border-transparent text-gray-500 hover:text-lavarage-coral hover:border-lavarage-orange/50'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mr-1 xl:mr-2 transition-colors duration-300 ${
                        active ? 'text-lavarage-red' : ''
                      }`}
                    />
                    <span className="hidden xl:inline">{item.name}</span>
                    <span className="xl:hidden text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Wallet and User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Wallet Connection */}
            {connected && publicKey ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Wallet Address Display */}
                <div className="hidden sm:flex items-center space-x-2 glass-lavarage rounded-lg px-2 lg:px-3 py-2 transition-all duration-300 hover:shadow-lg">
                  <div className="status-connected h-2 w-2 rounded-full shadow-sm"></div>
                  <span className="text-xs lg:text-sm font-medium text-gray-700">
                    {truncateAddress(publicKey.toBase58())}
                  </span>
                </div>

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
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Mobile/Tablet: Icon-only wallet button */}
                <div className="lg:hidden">
                  <button
                    onClick={handleMobileWalletClick}
                    className="p-2 rounded-lg bg-gradient-to-r from-lavarage-orange to-lavarage-red hover:from-lavarage-red hover:to-lavarage-coral transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    aria-label="Connect wallet"
                  >
                    <Wallet className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                {/* Desktop: Full wallet button */}
                <div className="hidden lg:block">
                  <WalletMultiButton className="btn-lavarage !text-white !font-bold !shadow-lg hover:!shadow-xl !transition-all !duration-300" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-lavarage-orange/10 bg-gradient-to-r from-lavarage-subtle to-transparent animate-in slide-in-from-top-2 duration-200">
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
