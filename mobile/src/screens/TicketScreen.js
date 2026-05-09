import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';

export default function TicketScreen({ route, navigation }) {
  const { qrCode, event } = route.params;

  const handleDownload = () => {
    Alert.alert('Download', 'Mock: The QR code has been saved to your gallery! (In a real app, this would use expo-media-library).');
  };

  return (
    <View style={styles.container}>
      <View style={styles.ticketCard}>
        <Text style={styles.title}>Your Ticket</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()} - {event.location}</Text>
        
        {event.selectedRole && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{event.selectedRole}</Text>
          </View>
        )}

        <View style={styles.qrContainer}>
          {qrCode ? (
            <Image source={{ uri: qrCode }} style={styles.qrCode} />
          ) : (
            <Text style={styles.errorText}>QR Code unavailable</Text>
          )}
        </View>

        <Text style={styles.instructions}>Show this QR code at the entrance.</Text>
      </View>

      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.secondary, marginTop: 20 }]} onPress={handleDownload}>
        <Text style={styles.buttonText}>Download QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.primaryButton, { marginTop: 10 }]} onPress={() => navigation.navigate('Events')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  ticketCard: { backgroundColor: COLORS.white, padding: 30, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  eventTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, textAlign: 'center', marginBottom: 8 },
  eventDate: { fontSize: 16, color: COLORS.textMain, marginBottom: 20 },
  roleBadge: { backgroundColor: COLORS.secondary, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, marginBottom: 20 },
  roleText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  qrContainer: { padding: 10, backgroundColor: COLORS.white, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 20 },
  qrCode: { width: 200, height: 200 },
  instructions: { fontSize: 14, color: COLORS.textLight, fontStyle: 'italic' },
  primaryButton: { backgroundColor: COLORS.darkNavy, paddingVertical: 14, borderRadius: 8, alignItems: 'center', width: '100%' },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  errorText: { color: COLORS.error }
});
