import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

import LoginScreen from '../screens/Auth/LoginScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import CompaniesListScreen from '../screens/Dashboard/CompaniesListScreen';
import ProfileScreen from '../screens/Dashboard/ProfileScreen';

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  Companies: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <AppStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'SmartGesso' }}
      />
      <AppStack.Screen
        name="Companies"
        component={CompaniesListScreen}
        options={{ title: 'Empresas' }}
      />
      <AppStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Meu Perfil' }}
      />
    </AppStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
