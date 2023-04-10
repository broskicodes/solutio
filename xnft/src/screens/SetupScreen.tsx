import { Button, Modal } from "react-native";
import { Screen } from "../components/Screen";
import { Section } from "../components/Section";
import { Payments } from "../components/Payments";
import { useState } from "react";
import { NewPayment } from "../components/NewPayment";
import { HomeScreenProps } from "../utils/navigators";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function SetupScreen({ navigation }: HomeScreenProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <Screen>
      <Modal visible={showModal} animationType={"fade"}>
        <MaterialCommunityIcons
          name="close"
          size={25}
          onPress={() => {
            setShowModal(false);
          }}
        />
        <NewPayment setShowModal={setShowModal} />
      </Modal>
      <Section title="Scheduled Payments">
        <Payments navigate={navigation.navigate} goBack={navigation.goBack} />
      </Section>
      <Button
        onPress={() => {
          setShowModal(true);
        }}
        title="Create New Payment"
      />
    </Screen>
  );
}
