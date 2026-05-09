import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { login } = useContext(AuthContext);

  const toggleMode = (isAdmin) => {
    setIsAdminMode(isAdmin);
    setEmail('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>ACE</Text>
      <Text style={styles.subtitle}>College Communication Platform</Text>
      
      <View style={styles.form}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, !isAdminMode && styles.toggleBtnActive]} 
            onPress={() => toggleMode(false)}
          >
            <Text style={[styles.toggleText, !isAdminMode && styles.toggleTextActive]}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, isAdminMode && styles.toggleBtnActive]} 
            onPress={() => toggleMode(true)}
          >
            <Text style={[styles.toggleText, isAdminMode && styles.toggleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={[styles.button, isAdminMode && { backgroundColor: COLORS.secondary }]} onPress={() => login(email, password)}>
          <Text style={styles.buttonText}>{isAdminMode ? 'Admin Log In' : 'Log In'}</Text>
        </TouchableOpacity>
        
        {!isAdminMode && (
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{marginTop: 15}}>
            <Text style={styles.link}>Don't have an account? Register</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkNavy,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: COLORS.textMain,
    textAlign: 'center',
    fontWeight: '500',
  }
});
