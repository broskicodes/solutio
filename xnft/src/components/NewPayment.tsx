import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  delegateTransferAuthority,
  getNextThreadId,
  getThreadAuthorityPDA,
  getTokenAuthPDA,
  setupPayment,
} from "@solutio/sdk";
import { BaseSyntheticEvent, useState } from "react";
import { Button, TextInput, View } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { signAndSendTransaction } from "../utils";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Formik } from "formik";

interface NewPaymentProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewPayment = ({ setShowModal }: NewPaymentProps) => {
  const provider = useSolanaProvider();
  const program = useAnchorProgram();

  return (
    <View>
      <Formik
        initialValues={{
          receiver: "",
          mintAddress: "",
          delegateAmnt: 0,
          transferAmnt: 0,
        }}
        onSubmit={async (vals) => {
          if (!program || !provider) {
            console.log("Missing provider");
            return;
          }
      
          // const receiverKey = new PublicKey(vals.receiver); // BtdMgTGPjwyaoXYjyniQ9FdUWjPXJkFArCAN61Ectubt
          const receiverKey = new PublicKey("CrfpUKyn8XhpWfoiGSX6rKpbqpPJZ6QJwaQbBrvZVQrd");
          // const mintKey = new PublicKey(vals.mintAddress); // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
          const mintKey = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");
      
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
                new BN(vals.delegateAmnt),
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
              new BN(vals.transferAmnt),
              nextThreadId,
              { now: {} },
              program
            )
          );
      
          const sig = await signAndSendTransaction(ixs, provider);
          setShowModal(false);
          console.log(sig);
        }}
      >
        {(props) => (
          <View>
            <TextInput
              value={props.values.receiver}
              onChangeText={props.handleChange("receiver")}
              placeholder="Receiver Pubkey"
            />
            {/* Change to <select> */}
            <TextInput
              value={props.values.mintAddress}
              onChangeText={props.handleChange("mintAddress")}
              placeholder="Mint Pubkey"
            />
            <TextInput
              value={props.values.delegateAmnt === 0 ? "" : props.values.delegateAmnt.toString()}
              onChangeText={props.handleChange("delegateAmnt")}
              placeholder="Amount to Delegate"
            />
            <TextInput
              value={props.values.transferAmnt === 0 ? "" : props.values.transferAmnt.toString()}
              onChangeText={props.handleChange("transferAmnt")}
              placeholder="Amount to Transfer"
            />
            <Button onPress={props.handleSubmit} title="Send Tx" />
          </View>
        )}
      </Formik>

    </View>
  );
};
