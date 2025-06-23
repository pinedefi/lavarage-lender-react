import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletContextProvider } from "@/contexts/WalletContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Offers from "@/pages/Offers";
import Positions from "@/pages/Positions";
import Liquidations from "@/pages/Liquidations";
import Balances from "@/pages/Balances";
import CreateOffer from "@/pages/CreateOffer";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";

// Environment configuration
const App: React.FC = () => {
  return (
    <ErrorProvider>
      <WalletContextProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Main Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Offers Management */}
              <Route path="/offers" element={<Offers />} />
              <Route path="/create-offer" element={<CreateOffer />} />
              <Route path="/balances" element={<Balances />} />

              {/* Positions Monitoring */}
              <Route path="/positions" element={<Positions />} />

              {/* Liquidations */}
              <Route path="/liquidations" element={<Liquidations />} />

              {/* Analytics */}
              <Route path="/analytics" element={<Analytics />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </WalletContextProvider>
    </ErrorProvider>
  );
};

export default App;
