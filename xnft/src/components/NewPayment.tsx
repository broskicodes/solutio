import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  constructSetupIxQR,
  ConvertableString,
  convertStringToSchedule,
  delegateTransferAuthorityIx,
  getNextThreadId,
  getThreadAuthorityPDA,
  getTokenAuthPDA,
  setupPaymentIx,
} from "@solutio/sdk";
import { Button, Text, TextInput, View } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import {
  signAndSendTransaction,
  TEST_MINT_ADDRESS,
  TEST_MINT_AMOUNT,
} from "../utils";
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Formik } from "formik";
import { useRef, useState } from "react";
import SelectDropdown from "react-native-select-dropdown";
import testKp from "../../test-mint-auth-keypair.json";
import { Section } from "./Section";

interface NewPaymentProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewPayment = ({ setShowModal }: NewPaymentProps) => {
  const { provider } = useSolanaProvider();
  const program = useAnchorProgram();
  const [scheduleStr, setScheduleStr] =
    useState<ConvertableString>("Immediate");
  const qrRef = useRef<HTMLDivElement>();

  const sendTx = async (
    receiver: string,
    mintAddress: string,
    delegateAmnt: number,
    transferAmnt: number,
    scheduleStr: ConvertableString
  ) => {
    if (!program || !provider) {
      console.log("Missing provider");
      return;
    }

    const receiverKey = new PublicKey(receiver); // BtdMgTGPjwyaoXYjyniQ9FdUWjPXJkFArCAN61Ectubt
    // const receiverKey = new PublicKey(
    //   "B2B2XZpk2a9hvpNBpXYNdZxg3Sy5WJb34wdoDgb5VFJ8"
    // );
    const mintKey = new PublicKey(mintAddress); // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // const mintKey = new PublicKey(
    //   "JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj"
    // );

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
        await delegateTransferAuthorityIx({
          taOwner: provider.wallet.publicKey,
          receiver: receiverKey,
          mint: mintKey,
          delegateAmount: new BN(delegateAmnt),
          program,
        })
      );
    }

    const [threadAuthKey] = getThreadAuthorityPDA(provider.wallet.publicKey);
    const nextThreadId = await getNextThreadId(
      provider.connection,
      threadAuthKey
    );

    ixs.push(
      await setupPaymentIx({
        taOwner: provider.wallet.publicKey,
        receiver: receiverKey,
        mint: mintKey,
        transferAmount: new BN(transferAmnt),
        threadId: nextThreadId,
        threadTrigger: convertStringToSchedule(scheduleStr),
        program,
      })
    );

    const qr = await constructSetupIxQR({
      receiver: receiverKey.toBase58(),
      mint: mintKey.toBase58(),
      amount: transferAmnt,
      delegateAmount: delegateAmnt,
      threadSchedule: scheduleStr,
    });

    // qr._svg
    // if (qrRef.current) {
    //   qrRef.current.innerHTML = "";
    //   qr.append(qrRef.current);
    // }

    const sig = await signAndSendTransaction(ixs, provider);
    setShowModal(false);

    console.log(sig);
  };

  return (
    <View className="flex justify-center items-center h-5/6">
      <View className="w-3/4">
        <Formik
          initialValues={{
            receiver: "",
            mintAddress: "",
            delegateAmnt: 0,
            transferAmnt: 0,
          }}
          onSubmit={async (vals) => {
            await sendTx(
              vals.receiver,
              vals.mintAddress,
              vals.delegateAmnt,
              vals.transferAmnt,
              scheduleStr
            );
          }}
        >
          {(props) => (
            <View>
              <View className="flex space-y-2 mb-6">
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
                  value={
                    props.values.delegateAmnt === 0
                      ? ""
                      : props.values.delegateAmnt.toString()
                  }
                  onChangeText={props.handleChange("delegateAmnt")}
                  placeholder="Amount to Delegate"
                />
                <TextInput
                  value={
                    props.values.transferAmnt === 0
                      ? ""
                      : props.values.transferAmnt.toString()
                  }
                  onChangeText={props.handleChange("transferAmnt")}
                  placeholder="Amount to Transfer"
                />
                <SelectDropdown
                  data={["Immediate", "Daily", "Weekly", "Monthly", "Yearly"]}
                  onSelect={(item) => {
                    setScheduleStr(item);
                  }}
                  buttonTextAfterSelection={(item) => item}
                  rowTextForSelection={(item) => item}
                />
              </View>
              <Button onPress={props.handleSubmit} title="Send Tx" />
            </View>
          )}
        </Formik>
        <Section title="Test" className="mt-4">
          <Button
            title={"Create Test Payment"}
            onPress={async () => {
              if (!program || !provider) {
                console.log("Cannot process tx at this time");
                return;
              }

              const xNftTestKp = Keypair.fromSecretKey(Uint8Array.from(testKp));
              const ata = await getOrCreateAssociatedTokenAccount(
                provider.connection,
                xNftTestKp,
                TEST_MINT_ADDRESS,
                provider.publicKey
              );

              if (ata.amount.toString() === "0") {
                await mintTo(
                  provider.connection,
                  xNftTestKp,
                  TEST_MINT_ADDRESS,
                  ata.address,
                  xNftTestKp,
                  TEST_MINT_AMOUNT
                );
              }

              sendTx(
                provider?.publicKey.toString(),
                TEST_MINT_ADDRESS.toString(),
                TEST_MINT_AMOUNT,
                10,
                "TEST"
              );
            }}
          />
          <Text>
            Create a test payment that sends tokens to your own token account
            every minute.
          </Text>
          <Text>The tokens are provided for you.</Text>
        </Section>
      </View>
      <View ref={qrRef} />
    </View>
  );
};
