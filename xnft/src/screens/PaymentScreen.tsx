import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  cancelPayment,
  PaymentType,
  updatePayment,
} from "@soltility/autopay-sdk";
import { BN } from "bn.js";
import { BaseSyntheticEvent, useState } from "react";
import { Button, Modal } from "react-native";
import { Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { useAnchorProgram, useSolanaProvider } from "../hooks/xnft-hooks";
import { signAndSendTransaction } from "../utils";
import { HomeStackParamList } from "../utils/navigators";

export const PaymentScreen = ({ route, navigation }: NativeStackScreenProps<HomeStackParamList, 'Payment'>) => {
  const { payment } = route.params;
  const provider = useSolanaProvider();
  const program = useAnchorProgram();
  const [newAmnt, setNewAmnt] = useState(0);
  const [showUpdateModal, setShowUpadteModal] = useState(false);

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

    const ix = await updatePayment(
      provider.wallet,
      payment.receiver,
      payment.mint,
      payment.threadId,
      program,
      newAmnt > 0 ? new BN(newAmnt) : null,
      null // For now
    );

    const sig = await signAndSendTransaction([ix], provider);
    console.log(sig)
    setShowUpadteModal(false);
  };

  const cancelExistigPayment = async () => {
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

    const sig = await signAndSendTransaction([ix], provider);
    console.log(sig)
  };

  return (
    <Screen>
      <Modal visible={showUpdateModal} animationType="fade">
        <View>
        <MaterialCommunityIcons
          name="close"
          size={25}
          onPress={() => {
            setShowUpadteModal(false);
          }}
        />
          <TextInput value={newAmnt.toString()} onChange={updateNewAmnt} />
          {/* <TextInput value={} onChange={} Uncomment with release of recurring payments*/}
          <Button onPress={updateExistingPaymnet} title={"Confirm"} />
        </View>
      </Modal>
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
      <Button onPress={() => {
        setShowUpadteModal(true);
      }} title={"Update"} />
      <Button onPress={cancelExistigPayment} title={"cancel"} />
    </Screen>
  );
};
