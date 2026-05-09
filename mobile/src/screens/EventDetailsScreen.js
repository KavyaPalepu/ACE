import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Modal, TextInput } from 'react-native';
import { COLORS } from '../theme/colors';
import api from '../api';
import { AuthContext } from '../store/AuthContext';

export default function EventDetailsScreen({ route, navigation }) {
  const { event: paramEvent, eventId } = route.params;
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(paramEvent);
  const [loading, setLoading] = useState(!paramEvent);
  const [isRegistered, setIsRegistered] = useState(paramEvent?.registeredUsers?.some(r => (r.user?._id || r.user) === user?._id) || false);
  const [showAISummary, setShowAISummary] = useState(false);

  const id = eventId || paramEvent?._id;

  const fetchEventDetails = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (e) {
      console.log('Error fetching event details:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (event) {
      setIsRegistered(event.registeredUsers?.some(r => (r.user?._id || r.user) === user?._id));
    }
  }, [event]);
  
  // Role Selection Modal
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(event?.title || '');
  const [editDesc, setEditDesc] = useState(event?.description || '');
  const [editDate, setEditDate] = useState(event?.date ? event.date.split('T')[0] : '');
  const [editLoc, setEditLoc] = useState(event?.location || '');
  const [editImg, setEditImg] = useState(event?.imageUrl || '');

  useEffect(() => {
    if (event) {
      setEditTitle(event.title || '');
      setEditDesc(event.description || '');
      setEditDate(event.date ? event.date.split('T')[0] : '');
      setEditLoc(event.location || '');
      setEditImg(event.imageUrl || '');
    }
  }, [event]);

  const handleUpdateEvent = async () => {
    try {
      await api.put(`/events/${event._id}`, {
        title: editTitle,
        description: editDesc,
        date: new Date(editDate + 'T12:00:00'),
        location: editLoc,
        imageUrl: editImg
      });
      Alert.alert('Success', 'Event updated successfully!');
      setIsEditModalVisible(false);
      navigation.goBack(); // Go back to refresh list
    } catch (e) {
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const handleRegister = async (role) => {
    setLoading(true);
    try {
      const { data } = await api.post(`/events/${event._id}/register`, { role });
      Alert.alert('Success', `Registered successfully as ${role}!`);
      setIsRegistered(true);
      setIsRoleModalVisible(false);
      if (data.qrCode) {
        navigation.navigate('Ticket', { qrCode: data.qrCode, event: { ...event, selectedRole: role } });
      }
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Error registering for event');
    }
    setLoading(false);
  };

  const handleAISummarize = () => {
    setShowAISummary(!showAISummary);
  };

  const handleResourceRequest = () => {
    Alert.alert('Resource Request', 'Your request for resources/materials for this event has been submitted to the admin.');
  };

  const handleEventChat = () => {
    navigation.navigate('Chat', { roomName: `Event_${event._id}` });
  };

  if (loading && !event) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  const isEligible = event.eligibility?.department === 'All' || event.eligibility?.department === user?.department;

  return (
    <ScrollView style={styles.container}>
      {event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />}
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subtitle}>{new Date(event.date).toLocaleDateString()} at {event.location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.text}>{event.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eligibility</Text>
        <View style={[styles.eligibilityBadge, isEligible ? styles.eligible : styles.ineligible]}>
          <Text style={styles.eligibilityText}>
            {isEligible ? 'You are eligible' : 'Not eligible based on department'}
          </Text>
        </View>
        <Text style={styles.text}>Required Department: {event.eligibility?.department || 'All'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Features</Text>
        
        {user?.role === 'admin' ? (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Text style={styles.buttonText}>Edit Event Details</Text>
          </TouchableOpacity>
        ) : !isRegistered ? (
          <TouchableOpacity 
            style={[styles.primaryButton, (!isEligible || loading) && styles.disabledButton]}
            onPress={() => setIsRoleModalVisible(true)}
            disabled={!isEligible || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Register & Get Ticket</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View>
            <View style={[styles.eligibilityBadge, styles.eligible, {marginBottom: 15}]}>
              <Text style={styles.eligibilityText}>You are Registered ✓</Text>
            </View>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEventChat}>
              <Text style={styles.secondaryButtonText}>💬 Join Event Chat Group</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleResourceRequest}>
              <Text style={styles.secondaryButtonText}>📦 Structured Resource Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {showAISummary && (
          <View style={styles.aiSummaryBox}>
            <Text style={styles.aiSummaryTitle}>🤖 AI Smart Summary</Text>
            <Text style={styles.aiSummaryText}>
              This event "{event.title}" is scheduled for {new Date(event.date).toLocaleDateString()} at {event.location}. 
              It is open to the {event.eligibility?.department || 'All'} department. 
              Key takeaway: The event will focus on {event.description.substring(0, 50)}... and aims to provide structured collaboration opportunities.
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.secondaryButton, {marginTop: 10}]} onPress={handleAISummarize}>
          <Text style={styles.secondaryButtonText}>{showAISummary ? 'Hide AI Summary' : '🤖 Smart AI Summary'}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRoleModalVisible}
        onRequestClose={() => setIsRoleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Role</Text>
            
            {event.isPaid && (
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentText}>💰 This is a Paid Event: ₹{event.price}</Text>
                <Text style={styles.paymentSubtext}>Please scan the UPI QR below or pay at the desk.</Text>
                {/* Mock Payment QR */}
                <View style={styles.mockQrBox}>
                  <Text style={styles.mockQrText}>[ Mock UPI QR Code ]</Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.roleBtn, { backgroundColor: COLORS.primary }]} 
              onPress={() => handleRegister('Participant')}
            >
              <Text style={styles.roleBtnText}>Register as Participant</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, { backgroundColor: COLORS.secondary, marginTop: 10 }]} 
              onPress={() => handleRegister('Audience')}
            >
              <Text style={styles.roleBtnText}>Register as Audience</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalCloseBtn, { marginTop: 15 }]} onPress={() => setIsRoleModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Event Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Event Details</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Event Title *" value={editTitle} onChangeText={setEditTitle} />
              <TextInput style={styles.input} placeholder="Description *" value={editDesc} onChangeText={setEditDesc} multiline />
              <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD) *" value={editDate} onChangeText={setEditDate} />
              <TextInput style={styles.input} placeholder="Venue/Location *" value={editLoc} onChangeText={setEditLoc} />
              <TextInput style={styles.input} placeholder="Poster Image URL" value={editImg} onChangeText={setEditImg} />
              
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateEvent}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditModalVisible(false)}>
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
  headerImage: { width: '100%', height: 200 },
  header: { padding: 24, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 12 },
  text: { fontSize: 16, color: COLORS.textMain, lineHeight: 24 },
  eligibilityBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10 },
  eligible: { backgroundColor: COLORS.secondary },
  ineligible: { backgroundColor: COLORS.error },
  eligibilityText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  disabledButton: { backgroundColor: COLORS.textLight },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
  secondaryButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  aiSummaryBox: { backgroundColor: '#eef', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: COLORS.primary },
  aiSummaryTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 8 },
  aiSummaryText: { fontSize: 14, color: COLORS.textMain, lineHeight: 20 },
  
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: COLORS.white, padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 15, textAlign: 'center' },
  roleBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  roleBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  modalCloseBtn: { paddingVertical: 10, alignItems: 'center' },
  modalCloseBtnText: { color: COLORS.textLight, fontWeight: 'bold' },
  paymentInfo: { backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ffeeba' },
  paymentText: { fontSize: 16, fontWeight: 'bold', color: '#856404', marginBottom: 5 },
  paymentSubtext: { fontSize: 12, color: '#856404', marginBottom: 10 },
  mockQrBox: { height: 100, backgroundColor: '#e2e3e5', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  mockQrText: { color: '#383d41', fontStyle: 'italic' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 5 },
  cancelBtnText: { color: COLORS.textLight, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 }
});
