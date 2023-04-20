import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import rpcObj from '../sol-mb-rpc.json';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';


// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProps {
  network: WalletAdapterNetwork,
  children: JSX.Element | JSX.Element[] | null
}

export const Wallet = ({ children, network }: WalletProps) => {
    const { endpoint, config } =  
       useMemo(() => {
        return network === "mainnet-beta"
          ? { endpoint: rpcObj.rpc, config: { wsEndpoint: rpcObj.ws } }
          : { endpoint: clusterApiUrl(network), config: {} }
      }, []);

    const wallets = useMemo(
        () => [
          new PhantomWalletAdapter()
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint} config={config}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};