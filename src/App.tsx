import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
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
        
        {/* LAVARAGE Toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options with LAVARAGE branding
            className: 'font-medium',
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#374151',
              border: '1px solid rgba(255, 132, 92, 0.3)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(255, 132, 92, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            },
            // Success toasts with LAVARAGE green
            success: {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: '1px solid #10b981',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              },
            },
            // Error toasts with LAVARAGE red
            error: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #FF845C 0%, #FF433F 100%)',
                color: '#ffffff',
                border: '1px solid #FF433F',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(255, 67, 63, 0.3)',
              },
            },
            // Loading toasts with LAVARAGE primary
            loading: {
              duration: Infinity,
              style: {
                background: 'linear-gradient(135deg, #FFDD6F 0%, #FF845C 100%)',
                color: '#ffffff',
                border: '1px solid #FF845C',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(255, 132, 92, 0.3)',
              },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ message }) => (
                <div className="flex items-center w-full">
                  {t.type !== 'loading' && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors duration-200"
                      aria-label="Dismiss notification"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                  <div className="flex items-center">
                    <div>{message}</div>
                  </div>
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
      </WalletContextProvider>
    </ErrorProvider>
  );
};

export default App;
