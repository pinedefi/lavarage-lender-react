import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';
import { LavarageLogo } from '@/components/brand';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Dashboard', href: '/' },
      { name: 'Offers', href: '/offers' },
      { name: 'Positions', href: '/positions' },
      { name: 'Analytics', href: '/analytics' },
    ],
    resources: [
      { name: 'Documentation', href: 'https://docs.lavarage.com', external: true },
      { name: 'API Reference', href: 'https://api.lavarage.com/docs', external: true },
      { name: 'Support', href: 'https://support.lavarage.com', external: true },
      { name: 'Status', href: 'https://status.lavarage.com', external: true },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Risk Disclosure', href: '/risk-disclosure' },
    ],
    social: [
      {
        name: 'Twitter',
        href: 'https://twitter.com/lavarage',
        icon: Twitter,
      },
      {
        name: 'Discord',
        href: 'https://discord.gg/lavarage',
        icon: MessageCircle,
      },
      {
        name: 'GitHub',
        href: 'https://github.com/lavarage',
        icon: Github,
      },
    ],
  };

  return (
    <footer className="bg-white border-t border-lavarage-orange/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <LavarageLogo 
                variant="horizontal" 
                size="md" 
                className="transition-all duration-300 hover:scale-105"
              />
            </div>
            <p className="mt-4 text-gray-600 max-w-md leading-relaxed">
              Earn competitive returns on your crypto holdings through decentralized lending. 
              Professional-grade tools for liquidity providers and DeFi lenders powered by LAVARAGE.
            </p>
            <div className="mt-6 glass-lavarage rounded-lg p-3 inline-block">
              <p className="text-sm text-gray-700 font-medium">
                🚀 Built on Solana for fast, low-cost transactions
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4 pb-2 border-b-2 border-lavarage-primary inline-block">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-600 hover:text-lavarage-red transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4 pb-2 border-b-2 border-lavarage-primary inline-block">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-lavarage-red transition-all duration-300 inline-flex items-center group"
                    >
                      {item.name}
                      <ExternalLink className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-lavarage-red transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-lavarage-orange/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-600 text-sm">
                © {currentYear} <span className="lavarage-text font-bold">LAVARAGE</span>. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {footerLinks.legal.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-500 hover:text-lavarage-coral text-sm transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerLinks.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-lavarage-coral transition-all duration-300 p-2 rounded-full hover:bg-lavarage-subtle group"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-lavarage-subtle border-t border-lavarage-orange/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="glass-lavarage rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              <strong className="text-lavarage-red">⚠️ Risk Warning:</strong> DeFi lending involves significant risks including potential loss of funds. 
              Past performance does not guarantee future results. Please read our{' '}
              <Link to="/risk-disclosure" className="text-lavarage-coral hover:text-lavarage-red font-medium transition-colors duration-300">
                risk disclosure
              </Link>{' '}
              before participating.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
