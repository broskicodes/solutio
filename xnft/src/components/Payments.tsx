import { cancelPayment } from "@soltility/autopay-sdk";
import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { PaymentType } from "@soltility/autopay-sdk";
import { signAndSendTransaction } from "../utils";

export const Payments = () => {
  const provider = useSolanaProvider();
  const program = useAnchorProgram();
  const [payments, setPayments] = useState<PaymentType[]>([]);

  const getExistingPayments = async () => {
    if (!program || !provider) {
      console.log("Missing provider");
      return [];
    }

    const payments = await program.account.payment.all();

    return payments.map((info): PaymentType => {
      let account = info.account as unknown as PaymentType;

      return {
        threadAuthority: account.threadAuthority,
        tokenAuthority: account.tokenAuthority,
        threadKey: account.threadKey,
        threadId: account.threadId,
        payer: account.payer,
        receiver: account.receiver,
        mint: account.mint,
        amount: account.amount,
        schedule: account.schedule,
        status: account.status,
      };
    });
  };

  const cancelExistigPayment = async (payment: PaymentType) => {
    if (!program || !provider) {
      console.log("Missing provider");
      return;
    }

    const ix = await cancelPayment(
      provider.wallet,
      payment.receiver,
      payment.mint,
      payment.threadId,
      program
    );

    await signAndSendTransaction([ix], provider);
  };

  useEffect(() => {
    getExistingPayments().then((payments) => {
      setPayments(payments);
    });
  }, [program, provider]);

  return (
    <View>
      {payments.map((payment) => {
        return (
          <View key={payment.threadKey.toBase58()}>
            <Text>Mint: {payment.mint.toBase58()}</Text>
            <Text>Receiver: {payment.receiver.toBase58()}</Text>
            <Text>Amount: {payment.amount.toNumber()}</Text>
            <Text>
              {payment.schedule.now
                ? "Now"
                : payment.schedule.cron?.scheduleStr}
            </Text>
            <Text>
              Status:{" "}
              {payment.status.active
                ? "Active"
                : payment.status.cancelled
                ? "Cancelled"
                : "Complete"}
            </Text>
            <Button
              onPress={() => {
                /* Open <Payment> */
              }}
              title={"edit"}
            />
            <Button
              onPress={() => {
                cancelExistigPayment(payment);
              }}
              title={"cancel"}
            />
          </View>
        );
      })}
    </View>
  );
};
