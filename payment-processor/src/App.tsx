// import './App.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Wallet } from "./components/Wallet";
import { PaymentDetails } from './components/PaymentDetails';
import { BrowserRouter as Router, Route,  } from "react-router-dom";

const App = () => {
  return (
    <div className="App">
      <Wallet network={WalletAdapterNetwork.Mainnet}>
        <Router>
          {/* <Route> */}
            <PaymentDetails />
          {/* </Route> */}
        </Router>
      </Wallet>
    </div>
  );
}

export default App;

          // appName={appName}
          // msg={msg}
          // receiver={receiver}
          // mint={mint}
          // amount={amount}
          // threadSchedule={threadSchedule}
          // delegateAmount={delegateAmount}