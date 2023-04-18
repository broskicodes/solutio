import { Button, Image, Text } from "react-native";
import * as Linking from "expo-linking";
import { atom, useRecoilState } from "recoil";

import { Section } from "../components/Section";
import { Screen } from "../components/Screen";

const testAtom = atom<"native" | "bright">({
  key: "testAtom",
  default: "native",
});

function LearnMoreLink({ url }: { url: string }) {
  return <Text onPress={() => Linking.openURL(url)}>Learn more</Text>;
}

export function NotificationsScreen() {
  const [future, setFuture] = useRecoilState(testAtom);

  return (
    <Screen>
      <Text>Coming Soon</Text>
    </Screen>
  );
}
