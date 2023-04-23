import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Wallet } from "./components/Wallet";
import { PaymentDetails } from './components/PaymentDetails';
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  return (
    <div className="App">
      <Wallet network={WalletAdapterNetwork.Mainnet}>
        <Router>
          <PaymentDetails />
        </Router>
      </Wallet>
    </div>
  );
}

export default App;
