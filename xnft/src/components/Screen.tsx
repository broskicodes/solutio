import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useSolanaProvider } from "../hooks/xnft-hooks";

type Props = {
  style?: StyleProp<ViewStyle>;
  children: boolean | JSX.Element | JSX.Element[] | null;
};
export function Screen({ style, children }: Props) {
  const { isXnft } = useSolanaProvider();

  return (
  <View style={[styles.screen, style]}>
    {!isXnft && <WalletMultiButton />}
    {children}
  </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
  },
});
