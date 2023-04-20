// import './App.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Wallet } from "./components/Wallet";

function App() {
  return (
    <div className="App">
      <Wallet network={WalletAdapterNetwork.Devnet}>
        <p>Hey man</p>
      </Wallet>
    </div>
  );
}

export default App;
