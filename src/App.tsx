import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletContextProvider } from '@/contexts/WalletContext';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Offers from '@/pages/Offers';
import Positions from '@/pages/Positions';
import Liquidations from '@/pages/Liquidations';
import CreateOffer from '@/pages/CreateOffer';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';

// Environment configuration
const App: React.FC = () => {
  return (
    <WalletContextProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Main Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Offers Management */}
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/create" element={<CreateOffer />} />
            
            {/* Positions Monitoring */}
            <Route path="/positions" element={<Positions />} />
            
            {/* Liquidations */}
            <Route path="/liquidations" element={<Liquidations />} />
            
            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />
            
            {/* Redirects */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </WalletContextProvider>
  );
};

export default App;