import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

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
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Lavarage</span>
            </div>
            <p className="mt-4 text-gray-600 max-w-md">
              Earn competitive returns on your crypto holdings through decentralized lending. 
              Professional-grade tools for liquidity providers and DeFi lenders.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Built on Solana for fast, low-cost transactions
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
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
                      className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center"
                    >
                      {item.name}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
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
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-600 text-sm">
                © {currentYear} Lavarage. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {footerLinks.legal.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-500 hover:text-gray-600 text-sm transition-colors"
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
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            <strong>Risk Warning:</strong> DeFi lending involves significant risks including potential loss of funds. 
            Past performance does not guarantee future results. Please read our risk disclosure before participating.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;