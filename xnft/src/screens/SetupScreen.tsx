import { Button, Modal, View } from "react-native";
import { Screen } from "../components/Screen";
import { Section } from "../components/Section";
import { Payments } from "../components/Payments";
import { useState } from "react";
import { NewPayment } from "../components/NewPayment";
import { HomeScreenProps } from "../utils/navigators";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function SetupScreen({ navigation }: HomeScreenProps) {
  const [showModal, setShowModal] = useState(false);
  const [temp, setTemp] = useState(0);

  return (
    <Screen>
      <Modal visible={showModal} animationType={"fade"}>
        <View className="mt-4 ml-4">
          <MaterialCommunityIcons
            name="close"
            size={25}
            onPress={() => {
              setShowModal(false);
            }}
          />
        </View>
        <NewPayment setShowModal={setShowModal} setTemp={setTemp} />
      </Modal>
      <Section title="Scheduled Payments">
        <Payments
          navigate={navigation.navigate}
          goBack={navigation.goBack}
          temp={temp}
          setTemp={setTemp}
        />
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
