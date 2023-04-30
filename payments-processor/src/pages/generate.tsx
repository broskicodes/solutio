import { KeyGeneration } from "@/components/KeyGeneration";
import { Wallet } from "@/components/Wallet";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { config } from "dotenv";

export const getServerSideProps = async () => {
  config();

  return { props: {
    rpcUrl: process.env.MAINNET_RPC_URL,
    wsUrl: process.env.MAINNET_WSS_URL
  }}
}

interface Props {
  rpcUrl: string,
  wsUrl: string
}

export default function KeyGeneratePage({ rpcUrl, wsUrl }: Props) {
  return (
    <div>
      <Wallet network={WalletAdapterNetwork.Mainnet} rpcUrl={rpcUrl} wsUrl={wsUrl} >
        <KeyGeneration />
      </Wallet>
    </div>
  )
}