import { PaymentDetails } from '@/components/PaymentDetails'
import { Wallet } from '@/components/Wallet'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
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

export default function PaymentPage({ rpcUrl, wsUrl }: Props) {
  return (
    <div className="App">
      <Wallet network={WalletAdapterNetwork.Mainnet} rpcUrl={rpcUrl} wsUrl={wsUrl} >
        {/* <Router>
          <PaymentDetails />
        </Router> */}
      </Wallet>
    </div>
  )
}
