import {
  cancelPaymentIx,
  deserializePaymentType,
  PaymentType,
  SeriaizeablePaymentType,
  serializePaymentType,
  signAndSendTransaction,
} from "@solutio/sdk";
import { useEffect, useState } from "react";
import { View, Text, Button, TouchableOpacity, FlatList } from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { HomeStackParamList } from "../utils/navigators";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface PaymentsProps {
  navigate: NativeStackNavigationProp<HomeStackParamList, "Home">["navigate"];
  goBack: NativeStackNavigationProp<HomeStackParamList, "Home">["goBack"];
  temp: number;
  setTemp: React.Dispatch<React.SetStateAction<number>>;
}

export const Payments = ({ navigate, temp, setTemp }: PaymentsProps) => {
  const { provider } = useSolanaProvider();
  const program = useAnchorProgram();
  const [payments, setPayments] = useState<SeriaizeablePaymentType[]>([]);

  const getExistingPayments = async () => {
    if (!program || !provider) {
      console.log("Missing provider");
      return [];
    }

    const payments = await program.account.payment.all();

    return payments
      .filter((info) => {
        let account = info.account as unknown as PaymentType;

        return account.payer.equals(provider.publicKey);
      })
      .map((info): SeriaizeablePaymentType => {
        let account = info.account as unknown as PaymentType;

        return serializePaymentType({
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
        });
      });
  };

  const cancelExistigPayment = async (payment: PaymentType) => {
    if (!program || !provider) {
      console.log("Missing provider");
      return;
    }

    const ix = await cancelPaymentIx({
      taOwner: provider.wallet.publicKey,
      receiver: payment.receiver,
      mint: payment.mint,
      threadId: payment.threadId,
      program,
    });

    await signAndSendTransaction([ix], provider);

    // const qr = await constructCancelIxQR({
    //   receiver: payment.receiver.toBase58(),
    //   mint: payment.mint.toBase58(),
    //   threadId: payment.threadId,
    // });

    // if (qrRef.current) {
    //   qrRef.current.innerHTML = "";
    //   qr.append(qrRef.current);
    // }
  };

  useEffect(() => {
    getExistingPayments().then((payments) => {
      setPayments(payments);
    });
  }, [program, provider, temp]);

  return (
    <FlatList
      data={payments}
      keyExtractor={(item) => item.threadKey}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            navigate("Payment", { payment: item });
          }}
          onTouchStart={() => {}}
          onTouchEnd={() => {}}
        >
          <View>
            <Text>Mint: {item.mint}</Text>
            <Text>Receiver: {item.receiver}</Text>
            <Text>Amount: {item.amount}</Text>
            <Text>
              Status:{" "}
              {item.status.active
                ? "Active"
                : item.status.cancelled
                ? "Cancelled"
                : "Complete"}
            </Text>
            <Button
              onPress={() => {
                cancelExistigPayment(deserializePaymentType(item));
              }}
              title={"cancel"}
            />
          </View>
        </TouchableOpacity>
      )}
    />
    // <View ref={qrRef} />
  );
};
