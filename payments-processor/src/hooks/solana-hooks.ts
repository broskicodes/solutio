import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getSolutioProgram } from "@solutio/sdk";

export const useAnchorProvider = (): AnchorProvider | undefined => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection()
  const [provider, setProvider] = useState<AnchorProvider>();

  useEffect(() => {
    if (wallet) {
      setProvider(
        new AnchorProvider(
          connection,
          wallet,
          AnchorProvider.defaultOptions()
        )
      )
    }
  }, [wallet, connection]);

  return provider;
}

export const useAnchorProgram = (): Program | undefined => {
  const provider = useAnchorProvider();
  const [program, setProgram] = useState<Program>();

  useEffect(() => {
    if (provider) {
      setProgram(
        getSolutioProgram(provider)
      );
    }
  }, [provider]);

  return program;
}