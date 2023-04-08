import { Button } from "react-native";
import { Screen } from "../components/Screen";
import { Section } from "../components/Section";
import { Payments } from "../components/Payments";
import { useState } from "react";
import { NewPaymentScreen } from "./NewPaymentScreen";

export function HomeScreen() {
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);

  return (
    <Screen>
      <Section title="Scheduled Payments">
        <Payments></Payments>
      </Section>
      <Button
        onPress={() => {
          setShowPaymentScreen(true);
        }}
        title="Create New Payment"
      />
      {showPaymentScreen && <NewPaymentScreen />}
    </Screen>
  );
}
