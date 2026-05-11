import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// In development, you usually use your computer's local IP address instead of localhost.
// Web uses localhost, Android Emulator uses 10.0.2.2.
// For PHYSICAL devices (like your phone via Expo Go), you MUST change this to your computer's IPv4 address!
let API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://grapple-kilobyte-worry.ngrok-free.dev/api';
if (Platform.OS === 'android') {
  // If testing on a physical android device, you might need to comment this out
  // API_URL = 'http://10.0.2.2:5000/api'; 
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
