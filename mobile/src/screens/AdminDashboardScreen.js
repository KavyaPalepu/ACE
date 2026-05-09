import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';
import api from '../api';

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  // Modals Visibility
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isClubModalVisible, setIsClubModalVisible] = useState(false);

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventImg, setEventImg] = useState('');

  // Club Form State
  const [clubName, setClubName] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [clubImg, setClubImg] = useState('');

  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDesc || !eventDate || !eventLoc) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    try {
      await api.post('/events', {
        title: eventTitle,
        description: eventDesc,
        date: new Date(eventDate + 'T12:00:00'), // Append noon to avoid timezone shifts
        location: eventLoc,
        imageUrl: eventImg || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'
      });
      Alert.alert('Success', 'Event created successfully!');
      setIsEventModalVisible(false);
      // Clear fields
      setEventTitle(''); setEventDesc(''); setEventDate(''); setEventLoc(''); setEventImg('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleCreateClub = async () => {
    if (!clubName || !clubDesc) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    try {
      await api.post('/clubs', {
        name: clubName,
        description: clubDesc,
        imageUrl: clubImg || 'https://images.unsplash.com/photo-1515879212627-48761241328a?w=500'
      });
      Alert.alert('Success', 'Club created successfully!');
      setIsClubModalVisible(false);
      // Clear fields
      setClubName(''); setClubDesc(''); setClubImg('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create club');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.welcome}>Welcome, Admin!</Text>
            <Text style={styles.subtitle}>Manage events, clubs, and notifications.</Text>
          </View>
          <TouchableOpacity style={styles.topLogoutBtn} onPress={logout}>
            <Text style={styles.topLogoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.card} onPress={() => setIsEventModalVisible(true)}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>Post Event</Text>
          <Text style={styles.cardDesc}>Create a new college event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setIsClubModalVisible(true)}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <Text style={styles.cardTitle}>Post Club</Text>
          <Text style={styles.cardDesc}>Register a new student club</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminRequests')}>
          <Text style={styles.cardIcon}>📩</Text>
          <Text style={styles.cardTitle}>View Requests</Text>
          <Text style={styles.cardDesc}>Approve email changes or leave requests</Text>
        </TouchableOpacity>
      </View>

      {/* Create Event Modal */}
      <Modal visible={isEventModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Event</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Event Title *" value={eventTitle} onChangeText={setEventTitle} />
              <TextInput style={styles.input} placeholder="Description *" value={eventDesc} onChangeText={setEventDesc} multiline />
              <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD) *" value={eventDate} onChangeText={setEventDate} />
              <TextInput style={styles.input} placeholder="Venue/Location *" value={eventLoc} onChangeText={setEventLoc} />
              <TextInput style={styles.input} placeholder="Poster Image URL" value={eventImg} onChangeText={setEventImg} />
              
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateEvent}>
                <Text style={styles.submitBtnText}>Submit Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEventModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Club Modal */}
      <Modal visible={isClubModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Club</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Club Name *" value={clubName} onChangeText={setClubName} />
              <TextInput style={styles.input} placeholder="Description *" value={clubDesc} onChangeText={setClubDesc} multiline />
              <TextInput style={styles.input} placeholder="Logo/Image URL" value={clubImg} onChangeText={setClubImg} />
              
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateClub}>
                <Text style={styles.submitBtnText}>Submit Club</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsClubModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#eee' },
  welcome: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkNavy },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 5 },
  actionsGrid: { padding: 15 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardIcon: { fontSize: 30, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy },
  cardDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  logoutBtn: { margin: 15, backgroundColor: COLORS.error, padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { width: '100%', backgroundColor: COLORS.white, padding: 20, borderRadius: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 5 },
  cancelBtnText: { color: COLORS.textLight, fontWeight: 'bold' },
  topLogoutBtn: { backgroundColor: COLORS.error, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5 },
  topLogoutText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 }
});
