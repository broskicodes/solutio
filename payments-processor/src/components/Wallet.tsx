import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProps {
  network: WalletAdapterNetwork,
  rpcUrl: string,
  wsUrl: string,
  children: JSX.Element | JSX.Element[] | null
}

export const Wallet = ({ children, network, rpcUrl, wsUrl }: WalletProps) => {
    const { endpoint, config } =  
       useMemo(() => {
        return network === "mainnet-beta"
          ? { endpoint: rpcUrl, config: { wsEndpoint: wsUrl } }
          : { endpoint: clusterApiUrl(network), config: {} }
      }, [network]);

    const wallets = useMemo(
        () => [
          new PhantomWalletAdapter()
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint as string} config={{ ...config, commitment: "finalized" }}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};