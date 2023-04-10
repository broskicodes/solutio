import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  delegateTransferAuthority,
  getNextThreadId,
  getThreadAuthorityPDA,
  getTokenAuthPDA,
  setupPayment,
  sleep,
} from "@soltility/autopay-sdk";
import { BaseSyntheticEvent, useState } from "react";
import { Button, TextInput, View } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { signAndSendTransaction } from "../utils";
import { getAssociatedTokenAddress } from "@solana/spl-token";

interface NewPaymentProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const NewPayment = ({ setShowModal }: NewPaymentProps) => {
  const provider = useSolanaProvider();
  const program = useAnchorProgram();
  const [receiver, setReceiver] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [delegateAmnt, setDelegateAmnt] = useState(0);
  const [transferAmnt, setTransferAmnt] = useState(0);

  const updateReceiver = (event: BaseSyntheticEvent) => {
    setReceiver(event.target.value);
  };

  const updateMintAddress = (event: BaseSyntheticEvent) => {
    setMintAddress(event.target.value);
  };

  const updateDelegateAmnt = (event: BaseSyntheticEvent) => {
    const { value } = event.target;
    if (Number.isNaN(Number(value))) {
      return;
    }

    setDelegateAmnt(Number(value));
  };

  const updateTransferAmnt = (event: BaseSyntheticEvent) => {
    const { value } = event.target;
    if (Number.isNaN(Number(value))) {
      return;
    }

    setTransferAmnt(Number(value));
  };

  const sendTx = async () => {
    if (!program || !provider) {
      console.log("Missing provider");
      return;
    }

    const receiverKey = new PublicKey(receiver); // BtdMgTGPjwyaoXYjyniQ9FdUWjPXJkFArCAN61Ectubt
    // const receiverKey = new PublicKey("CrfpUKyn8XhpWfoiGSX6rKpbqpPJZ6QJwaQbBrvZVQrd");
    const mintKey = new PublicKey(mintAddress); // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // const mintKey = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");

    const ixs: TransactionInstruction[] = [];

    const userTa = await getAssociatedTokenAddress(
      mintKey,
      provider.wallet.publicKey
    );
    const receiverTa = await getAssociatedTokenAddress(mintKey, receiverKey);
    const [tokenAuthKey] = getTokenAuthPDA(
      provider.wallet.publicKey,
      userTa,
      receiverTa
    );
    const tokAuthAcnt = await provider.connection.getAccountInfo(tokenAuthKey);

    if (!tokAuthAcnt) {
      ixs.push(
        await delegateTransferAuthority(
          provider.wallet,
          receiverKey,
          mintKey,
          new BN(delegateAmnt),
          program
        )
      );
    }

    const [threadAuthKey] = getThreadAuthorityPDA(provider.wallet.publicKey);
    const nextThreadId = await getNextThreadId(
      provider.connection,
      threadAuthKey
    );

    ixs.push(
      await setupPayment(
        provider.wallet,
        receiverKey,
        mintKey,
        new BN(transferAmnt),
        nextThreadId,
        { now: {} },
        program
      )
    );

    const sig = await signAndSendTransaction(ixs, provider);
    setShowModal(false);
    console.log(sig);
  };

  return (
    <View>
      <TextInput value={receiver} onChange={updateReceiver} />
      {/* Change to <select> */}
      <TextInput value={mintAddress} onChange={updateMintAddress} />
      <TextInput
        value={delegateAmnt.toString()}
        onChange={updateDelegateAmnt}
      />
      <TextInput
        value={transferAmnt.toString()}
        onChange={updateTransferAmnt}
      />

      <Button onPress={sendTx} title="Send Tx" />
    </View>
  );
};
