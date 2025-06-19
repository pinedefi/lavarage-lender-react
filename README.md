# Lavarage Lender Dashboard

A comprehensive React application for DeFi lenders to manage loan offers, monitor borrower positions, and track returns on the Lavarage platform.

## 🚀 Features

- **Wallet Integration**: Seamless Solana wallet connectivity with multiple wallet support
- **NFT-Gated Access**: Lavarock NFT ownership required for lender operations
- **Loan Offer Management**: Create, update, and monitor lending offers
- **Position Tracking**: Real-time monitoring of borrower positions using your liquidity
- **Liquidation Management**: Track liquidation events and collateral recovery
- **Performance Analytics**: Comprehensive portfolio insights and metrics
- **Responsive Design**: Mobile-first approach with cross-device compatibility

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Wallet Integration**: Solana Wallet Adapter
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/piske-alex/lavarage-lender-react.git
   cd lavarage-lender-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   REACT_APP_API_URL=https://api.lavarage.com
   REACT_APP_API_KEY=your_api_key_here
   REACT_APP_SOLANA_NETWORK=mainnet-beta
   REACT_APP_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   REACT_APP_HELIUS_API_KEY=your_helius_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 🏗️ Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## 🧪 Testing

```bash
npm test
```

Runs the test suite in interactive watch mode.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Card, etc.)
│   └── Layout/         # Layout components (Header, Footer)
├── contexts/           # React contexts (Wallet, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services and external integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## 🔑 Key Components

### Wallet Integration
- Supports Phantom, Solflare, Backpack, and other Solana wallets
- Persistent connection across sessions
- Transaction signing and submission

### Offer Management
- Create new loan offers with customizable parameters
- Real-time utilization tracking
- Interest rate and exposure limit management

### Position Monitoring
- Live borrower position tracking
- Risk assessment and LTV monitoring
- Interest accrual calculations

### Liquidation Tracking
- Liquidation event monitoring
- Collateral recovery tracking
- P&L calculations

## 🎨 Design System

The app uses a custom design system built on Tailwind CSS:

- **Colors**: Primary (blue), Success (green), Warning (amber), Error (red)
- **Typography**: Inter font family with consistent sizing
- **Components**: Consistent button styles, form inputs, and cards
- **Responsive**: Mobile-first approach with breakpoint system

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Lavarage API endpoint | `https://api.lavarage.com` |
| `REACT_APP_API_KEY` | API key for authentication | Required |
| `REACT_APP_SOLANA_NETWORK` | Solana network | `mainnet-beta` |
| `REACT_APP_SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `REACT_APP_HELIUS_API_KEY` | Helius API key for NFT validation | Required for NFT features |

### Wallet Configuration

The app automatically detects and connects to available Solana wallets:
- Phantom
- Solflare  
- Backpack
- Trust Wallet

## 📖 Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred Solana wallet
2. **NFT Verification**: Ensure your wallet contains a Lavarock NFT for access to lender features
3. **Create Offers**: Navigate to "My Offers" → "Create Offer" to set up lending terms
4. **Monitor Positions**: View active borrower positions in the "Positions" tab
5. **Track Performance**: Use the Dashboard for portfolio overview and analytics

### 🔐 NFT Access Control

The application implements NFT-gated access for lender operations:

- **Read Access**: All users can view balances, offers, positions, and analytics
- **Write Access**: Lavarock NFT required for creating offers, deposits, withdrawals, and other lender operations
- **Collection Validation**: Validates against the official Lavarock collection (`3HeEvzCyUK3M7Q2xkvMeZojAnVYmn3yHGHHJHmRktUVw`)
- **Real-time Checking**: NFT ownership is verified when wallet connects and can be refreshed
- **Graceful UX**: Users without NFTs see disabled buttons with helpful messages
- **Frontend & Backend**: Validation occurs on both frontend (UX) and backend (security) levels
- **Real-time Status**: NFT ownership status is displayed in the header for transparency

## 🚨 Risk Considerations

⚠️ **Important**: DeFi lending involves significant risks including:
- Smart contract risks
- Borrower default risk
- Collateral volatility
- Liquidation recovery risk

Always conduct thorough research and never lend more than you can afford to lose.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Lavarage Website](https://lavarage.com)
- [API Documentation](https://docs.lavarage.com)
- [Support](https://support.lavarage.com)
- [Discord Community](https://discord.gg/lavarage)

## ⚡ Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Load Time**: <2s on 3G networks
- **Real-time Updates**: 30-second polling intervals

---

**Built with ❤️ for the DeFi community**