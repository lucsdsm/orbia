import "react-native-reanimated";
import "react-native-gesture-handler";

import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ItensProvider, useItens } from "./contexts/ItensContext";
import { CartoesProvider } from "./contexts/CartoesContext";
import { SaldoProvider } from "./contexts/SaldoContext";

import Toast from "react-native-toast-message";

import LoadingScreen from "./components/LoadingScreen";
import Navigator from "./components/Navigator";
import Login from "./screens/Login";
import ItemAdd from "./screens/ItemAdd";
import ItemEdit from "./screens/ItemEdit";
import CardList from "./screens/CardList";
import CardAdd from "./screens/CardAdd";
import CardEdit from "./screens/CardEdit";

const Stack = createStackNavigator();

function AppContent() {
  const { loading } = useItens();
  const { user, loading: authLoading } = useAuth();

  if (loading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}>
        {!user ? (
          // Se não estiver logado, mostra a tela de login
          <Stack.Screen name="Login" component={Login} />
        ) : (
          // Se estiver logado, mostra o app normal
          <>
            <Stack.Screen name="Drawer" component={Navigator} />
            <Stack.Screen name="ItemAdd" component={ItemAdd} />
            <Stack.Screen
              name="ItemEdit"
              component={ItemEdit}
              options={{
                presentation: "Sandwich",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="CardList" component={CardList} />
            <Stack.Screen name="CardAdd" component={CardAdd} />
            <Stack.Screen name="CardEdit" component={CardEdit} />
          </>
        )}
      </Stack.Navigator>
      <Toast 
        topOffset={60}
        visibilityTime={2000}
        autoHide={true}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SaldoProvider>
          <CartoesProvider>
            <ItensProvider>
              <AppContent />
            </ItensProvider>
          </CartoesProvider>
        </SaldoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
