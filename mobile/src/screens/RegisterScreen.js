import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'Computer Science', year: '1', rollNumber: '' });
  const { register } = useContext(AuthContext);

  const handleRegister = () => {
    register({ ...form, role: 'user' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          value={form.name}
          onChangeText={(v) => setForm({...form, name: v})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Roll Number" 
          value={form.rollNumber}
          onChangeText={(v) => setForm({...form, rollNumber: v})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => setForm({...form, email: v})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry
          value={form.password}
          onChangeText={(v) => setForm({...form, password: v})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Department (e.g. Computer Science)" 
          value={form.department}
          onChangeText={(v) => setForm({...form, department: v})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Year (e.g. 1, 2, 3)" 
          keyboardType="numeric"
          value={form.year}
          onChangeText={(v) => setForm({...form, year: v})}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{marginTop: 15}}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.darkNavy,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
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
    backgroundColor: COLORS.secondary,
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
