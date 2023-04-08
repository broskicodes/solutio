import { PaymentType, updatePayment } from "@soltility/autopay-sdk";
import { BN } from "bn.js";
import { BaseSyntheticEvent, useState } from "react";
import { Button } from "react-native";
import { Text, TextInput, View } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";

interface PaymentProps {
  payment: PaymentType;
}
export const Paymnet = ({ payment }: PaymentProps) => {
  const provider = useSolanaProvider();
  const program = useAnchorProgram();
  const [newAmnt, setNewAmnt] = useState(0);

  const updateNewAmnt = (event: BaseSyntheticEvent) => {
    const { value } = event.target;
    if (Number.isNaN(Number(value))) {
      return;
    }

    setNewAmnt(Number(value));
  };

  const updateExistingPaymnet = async () => {
    if (!program || !provider) {
      console.log("Missing provider");
      return;
    }

    const ix = updatePayment(
      provider.wallet,
      payment.receiver,
      payment.mint,
      payment.threadId,
      program,
      newAmnt > 0 ? new BN(newAmnt) : null,
      null // For now
    );
  };

  return (
    <View>
      <Text>Mint: {payment.mint.toBase58()}</Text>
      <Text>Receiver: {payment.receiver.toBase58()}</Text>
      <Text>Amount: {payment.amount.toNumber()}</Text>
      <Text>
        {payment.schedule.now ? "Now" : payment.schedule.cron?.scheduleStr}
      </Text>
      <Text>
        Status:{" "}
        {payment.status.active
          ? "Active"
          : payment.status.cancelled
          ? "Cancelled"
          : "Complete"}
      </Text>
      <TextInput value={newAmnt.toString()} onChange={updateNewAmnt} />
      {/* <TextInput value={} onChange={} Uncomment with release of recurring payments*/}
      <Button onPress={updateExistingPaymnet} title={"Update"} />
    </View>
  );
};
