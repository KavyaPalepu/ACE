import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { COLORS } from '../theme/colors';
import api from '../api';
import { AuthContext } from '../store/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  
  // Email Request state
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmitEmailRequest = async () => {
    if (!newEmail || !reason) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      await api.post('/auth/profile/email-request', { newEmail, reason });
      Alert.alert('Success', 'Request submitted successfully! Admin will review it.');
      setIsEmailModalVisible(false);
      setNewEmail('');
      setReason('');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit request');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfile(data);
      setName(data.user.name);
      setDepartment(data.user.department || '');
      setYear(data.user.year?.toString() || '');
    } catch (e) {
      console.log('Error fetching profile:', e);
      Alert.alert('Error', 'Failed to load profile details.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        department,
        year: parseInt(year) || undefined
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setProfile({ ...profile, user: { ...profile.user, ...data } });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{profile?.user?.name}</Text>
        <Text style={styles.subtitle}>{profile?.user?.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editBtn}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            
            <Text style={styles.label}>Department</Text>
            <TextInput style={styles.input} value={department} onChangeText={setDepartment} />
            
            <Text style={styles.label}>Year</Text>
            <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Department:</Text>
              <Text style={styles.detailValue}>{profile?.user?.department || 'Not Set'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Year:</Text>
              <Text style={styles.detailValue}>{profile?.user?.year || 'Not Set'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role:</Text>
              <Text style={styles.detailValue}>{profile?.user?.role}</Text>
            </View>
            
            <TouchableOpacity style={styles.requestBtn} onPress={() => setIsEmailModalVisible(true)}>
              <Text style={styles.requestBtnText}>Request Email Change</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Registered Events</Text>
        {profile?.registeredEvents?.length > 0 ? (
          profile.registeredEvents.map((event) => (
            <TouchableOpacity key={event._id} style={styles.itemCard} onPress={() => navigation.navigate('EventDetails', { event })}>
              <Text style={styles.itemTitle}>{event.title}</Text>
              <Text style={styles.itemSubtitle}>{new Date(event.date).toLocaleDateString()} - {event.location}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No events registered yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Drafts (In-Progress)</Text>
        <TouchableOpacity style={styles.itemCard} onPress={() => navigation.navigate('EventDetails', { event: { title: 'Hackathon 2026', description: 'This is a draft registration that you stopped in the middle.', date: new Date(), location: 'Main Auditorium' } })}>
          <Text style={styles.itemTitle}>🤖 Hackathon 2026</Text>
          <Text style={styles.itemSubtitle}>Incomplete - Stopped at Team Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.itemCard} onPress={() => navigation.navigate('EventDetails', { event: { title: 'Cultural Fest', description: 'This is a draft registration that you stopped in the middle.', date: new Date(), location: 'Open Air Theatre' } })}>
          <Text style={styles.itemTitle}>🎨 Cultural Fest</Text>
          <Text style={styles.itemSubtitle}>Incomplete - Stopped at Slot Selection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Joined Clubs</Text>
        {profile?.user?.joinedClubs?.length > 0 ? (
          profile.user.joinedClubs.map((club) => (
            <TouchableOpacity key={club._id} style={styles.itemCard} onPress={() => navigation.navigate('ClubDetails', { clubId: club._id })}>
              <Text style={styles.itemTitle}>{club.name}</Text>
              <Text style={styles.itemSubtitle}>{club.description.substring(0, 50)}...</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No clubs joined yet.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEmailModalVisible}
        onRequestClose={() => setIsEmailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Email Change</Text>
            
            <Text style={styles.label}>New Email</Text>
            <TextInput 
              style={styles.input} 
              value={newEmail} 
              onChangeText={setNewEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.label}>Reason for Change</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={reason} 
              onChangeText={setReason} 
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.textLight }]} onPress={() => setIsEmailModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={handleSubmitEmailRequest}>
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 30, backgroundColor: COLORS.darkNavy, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  section: { padding: 20, backgroundColor: COLORS.white, marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy },
  editBtn: { color: COLORS.primary, fontWeight: 'bold' },
  details: { marginTop: 5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  detailLabel: { fontSize: 14, color: COLORS.textLight },
  detailValue: { fontSize: 14, color: COLORS.textMain, fontWeight: 'bold' },
  form: { marginTop: 10 },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5 },
  input: { backgroundColor: COLORS.background, padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 14 },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold' },
  itemCard: { padding: 15, backgroundColor: COLORS.background, borderRadius: 8, marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkNavy },
  itemSubtitle: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  emptyText: { color: COLORS.textLight, fontStyle: 'italic', marginTop: 5 },
  logoutBtn: { backgroundColor: COLORS.error, paddingVertical: 14, borderRadius: 8, alignItems: 'center', margin: 20, marginBottom: 40 },
  logoutBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  requestBtn: { marginTop: 15, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  requestBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: COLORS.white, padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 15, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.45, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: COLORS.white, fontWeight: 'bold' }
});
