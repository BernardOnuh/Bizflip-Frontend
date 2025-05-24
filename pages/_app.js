import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia } from 'wagmi/chains';
import { WagmiProvider, http, fallback } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { AuthProvider } from '@/contexts/AuthContext';

// Configure Alchemy API endpoint for Sepolia
const alchemySepoliaRpc = 'https://eth-sepolia.g.alchemy.com/v2/OYfUgn4U2ShLU0IpiHEzRyZRYS1plfnG';

// RainbowKit config
const config = getDefaultConfig({
  appName: 'Bizflip',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback([
      http(alchemySepoliaRpc), // Primary: Alchemy
      http('https://eth-sepolia.public.blastapi.io'), // Backup 1
      http('https://sepolia.gateway.tenderly.co'),    // Backup 2
      http('https://rpc.sepolia.org')                 // Backup 3
    ], {
      rank: true,
      timeout: 10000 // Increase timeout to 10 seconds
    })
  },
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}