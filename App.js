// App.js
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import OnboardingScreen from "./Screens/OnboardingScreen";
import AppNavigator from "./Screens/AppNavigator";

const Stack = createStackNavigator();

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  const handleOnboardingComplete = () => {
    setIsOnboardingCompleted(true);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isOnboardingCompleted ? (
          <Stack.Screen name="AppNavigator" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onOnboardingComplete={handleOnboardingComplete}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
