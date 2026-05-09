import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ClubsScreen from '../screens/ClubsScreen';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ClubDetailsScreen from '../screens/ClubDetailsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import TicketScreen from '../screens/TicketScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminRequestsScreen from '../screens/AdminRequestsScreen';

import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.darkNavy },
        headerTintColor: COLORS.white,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.background },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Clubs') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Events" component={HomeScreen} />
      <Tab.Screen name="Clubs" component={ClubsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="AIChat" component={AIChatScreen} />
      <RootStack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
      <RootStack.Screen name="ClubDetails" component={ClubDetailsScreen} options={{ headerShown: true, title: 'Club Details', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
      <RootStack.Screen name="EventDetails" component={EventDetailsScreen} options={{ headerShown: true, title: 'Event Details', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
      <RootStack.Screen name="Ticket" component={TicketScreen} options={{ headerShown: true, title: 'Your Ticket', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
    </RootStack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.darkNavy },
        headerTintColor: COLORS.white,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.background },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Clubs') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Events" component={HomeScreen} />
      <Tab.Screen name="Clubs" component={ClubsScreen} />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ headerShown: true, title: 'Event Details', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
      <Stack.Screen name="ClubDetails" component={ClubDetailsScreen} options={{ headerShown: true, title: 'Club Details', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
      <Stack.Screen name="AdminRequests" component={AdminRequestsScreen} options={{ headerShown: true, title: 'Pending Requests', headerStyle: { backgroundColor: COLORS.darkNavy }, headerTintColor: COLORS.white }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (user.role === 'admin' ? <AdminStack /> : <MainStack />) : <AuthStack />}
    </NavigationContainer>
  );
}
