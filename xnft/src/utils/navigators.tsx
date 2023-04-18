import { NotificationsScreen, SetupScreen, PaymentScreen } from "../screens/";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { SeriaizeablePaymentType } from "@solutio/sdk";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HomeTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

export type HomeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "Home"
>;

export type HomeStackParamList = {
  Home: undefined;
  Payment: { payment: SeriaizeablePaymentType };
};

export const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={SetupScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
    </HomeStack.Navigator>
  );
};

export const TabNavigator = () => {
  return (
    <HomeTab.Navigator
      initialRouteName="Main"
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
      }}
    >
      <HomeTab.Screen
        name="Main"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <HomeTab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
    </HomeTab.Navigator>
  );
};
