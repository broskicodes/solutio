import { cancelPayment } from "@soltility/autopay-sdk";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { PaymentType } from "@soltility/autopay-sdk";
import { signAndSendTransaction } from "../utils";
import { HomeScreenProps, HomeStackParamList } from "../utils/navigators";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface PaymentsProps {
  navigate: NativeStackNavigationProp<HomeStackParamList, 'Home'>['navigate'],
  goBack: NativeStackNavigationProp<HomeStackParamList, 'Home'>['goBack']
}

export const Payments = ({ navigate }: PaymentsProps) => {
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
      <FlatList
        data={payments}
        keyExtractor={(item) => item.threadKey.toBase58()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigate('Payment', { payment: item })
            }}
          >
            <View>
              <Text>Mint: {item.mint.toBase58()}</Text>
              <Text>Receiver: {item.receiver.toBase58()}</Text>
              <Text>Amount: {item.amount.toNumber()}</Text>
              <Text>
                {item.schedule.now ? "Now" : item.schedule.cron?.scheduleStr}
              </Text>
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
                  cancelExistigPayment(item);
                }}
                title={"cancel"}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
