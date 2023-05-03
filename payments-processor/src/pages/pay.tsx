import { PaymentDetails } from '@/components/PaymentDetails'
import { Wallet } from '@/components/Wallet'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { config } from "dotenv";

export const getServerSideProps = async () => {
  config();

  return { props: {
    rpcUrl: process.env.MAINNET_RPC_URL,
    wsUrl: process.env.MAINNET_WSS_URL,
    apiKey: process.env.SERVER_API_KEY
  }}
}

interface Props {
  rpcUrl: string,
  wsUrl: string,
  apiKey: string
}

export default function PaymentPage({ rpcUrl, wsUrl, apiKey }: Props) {
  return (
    <div className="App">
      <Wallet network={WalletAdapterNetwork.Mainnet} rpcUrl={rpcUrl} wsUrl={wsUrl} >
        <PaymentDetails apiKey={apiKey} />
      </Wallet>
    </div>
  )
}
