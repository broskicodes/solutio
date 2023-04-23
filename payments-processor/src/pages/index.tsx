import Image from 'next/image'
import { Inter } from 'next/font/google'
import { PaymentDetails } from '@/components/PaymentDetails'
import { Wallet } from '@/components/Wallet'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className="App">
      <Wallet network={WalletAdapterNetwork.Mainnet}>
        <Router>
          <PaymentDetails />
        </Router>
      </Wallet>
    </div>
  )
}
