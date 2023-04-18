import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  ConvertableString,
  convertStringToSchedule,
  delegateTransferAuthorityIx,
  getNextThreadId,
  getThreadAuthorityPDA,
  getTokenAuthPDA,
  setupPaymentIx,
  signAndSendTransaction,
} from "@solutio/sdk";
import { Button, Text, TextInput, View } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { TEST_MINT_ADDRESS, TEST_MINT_AMOUNT } from "../utils";
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Formik } from "formik";
import { useRef, useState } from "react";
import testKp from "../../test-mint-auth-keypair.json";
import { Section } from "./Section";
import { Picker } from "@react-native-picker/picker";

interface NewPaymentProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setTemp: React.Dispatch<React.SetStateAction<number>>;
}

export const NewPayment = ({ setShowModal, setTemp }: NewPaymentProps) => {
  const { provider } = useSolanaProvider();
  const program = useAnchorProgram();
  const [scheduleStr, setScheduleStr] =
    useState<ConvertableString>("Immediate");

  const sendTx = async (
    receiver: string,
    mintAddress: string,
    delegateAmnt: number,
    transferAmnt: number,
    scheduleStr: ConvertableString,
    ixs: TransactionInstruction[] = [],
    signers: Keypair[] = []
  ) => {
    if (!program || !provider) {
      console.log("Missing provider");
      return;
    }

    const receiverKey = new PublicKey(receiver); // BtdMgTGPjwyaoXYjyniQ9FdUWjPXJkFArCAN61Ectubt
    const mintKey = new PublicKey(mintAddress); // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

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

    // const qr = await constructSetupIxQR({
    //   receiver: receiverKey.toBase58(),
    //   mint: mintKey.toBase58(),
    //   amount: transferAmnt,
    //   delegateAmount: delegateAmnt,
    //   threadSchedule: scheduleStr,
    // });

    // qr._svg
    // if (qrRef.current) {
    //   qrRef.current.innerHTML = "";
    //   qr.append(qrRef.current);
    // }

    const sig = await signAndSendTransaction(ixs, provider, signers);
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
                <Picker
                  selectedValue={scheduleStr}
                  onValueChange={(val) => setScheduleStr(val)}
                >
                  {["Immediate", "Daily", "Weekly", "Monthly", "Yearly"].map(
                    (val) => (
                      <Picker.Item key={val} label={val} value={val} />
                    )
                  )}
                </Picker>
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

              const taIxs: TransactionInstruction[] = [];
              const xNftTestKp = Keypair.fromSecretKey(Uint8Array.from(testKp));

              const ata = await getAssociatedTokenAddress(
                TEST_MINT_ADDRESS,
                provider.publicKey
              );

              const ta = await getAccount(provider.connection, ata);

              if (!ta) {
                taIxs.push(
                  createAssociatedTokenAccountInstruction(
                    xNftTestKp.publicKey,
                    ata,
                    provider.publicKey,
                    TEST_MINT_ADDRESS
                  )
                );
              }

              if (!ta || ta.amount.toString() === "0") {
                taIxs.push(
                  createMintToInstruction(
                    TEST_MINT_ADDRESS,
                    ata,
                    xNftTestKp.publicKey,
                    TEST_MINT_AMOUNT
                  )
                );
              }

              sendTx(
                provider?.publicKey.toString(),
                TEST_MINT_ADDRESS.toString(),
                TEST_MINT_AMOUNT,
                10,
                "TEST",
                taIxs,
                taIxs.length > 0 ? [xNftTestKp] : []
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
      {/* <View ref={qrRef} /> */}
    </View>
  );
};
