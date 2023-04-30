import { useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react";


export const KeyGeneration = () => {
  const { publicKey } = useWallet();
  const [host, setHost] = useState('');
  const [apiKey, setApiKey] = useState('');

  return (
    <div>
      <div>
        <input className="text-black" value={host} placeholder="Host Url" onChange={(e) => {
          setHost(e.target.value)
        }} />
        <button disabled={!publicKey} onClick={async () => {
          const res = await fetch('/api/generate-key', 
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              pubkey: publicKey?.toString(),
              host: host
            })
          });

          res.json().then((key) => { 
            console.log(key)
            setApiKey(key) 
          });
        }}>Generate</button>
        </div>
        <div>
          <input disabled={true} value={apiKey} />
        </div>
    </div>
  )
}