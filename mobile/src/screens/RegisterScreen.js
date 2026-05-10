import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '', rollNumber: '' });
  const { register } = useContext(AuthContext);

  const handleRegister = () => {
    register({ ...form, role: 'user' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="John Doe" 
          value={form.name}
          onChangeText={(v) => setForm({...form, name: v})}
        />
        
        <Text style={styles.label}>Roll Number</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 21A91A0501" 
          value={form.rollNumber}
          onChangeText={(v) => setForm({...form, rollNumber: v})}
        />
        
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="email@example.com" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => setForm({...form, email: v})}
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Min 6 characters" 
          secureTextEntry
          value={form.password}
          onChangeText={(v) => setForm({...form, password: v})}
        />
        
        <Text style={styles.label}>Department</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Department Name" 
          value={form.department}
          onChangeText={(v) => setForm({...form, department: v})}
        />
        
        <Text style={styles.label}>Year</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Year" 
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkNavy,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
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
