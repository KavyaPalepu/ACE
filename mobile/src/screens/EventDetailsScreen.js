import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Modal, TextInput, Linking } from 'react-native';
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
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [modalStep, setModalStep] = useState('choose_role'); // 'choose_role' or 'payment'
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  
  const registration = event?.registeredUsers?.find(r => (r.user?._id || r.user) === user?._id);
  const isPaidVerified = registration?.paymentStatus === 'paid' || !event?.isPaid;

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
  const [editDate, setEditDate] = useState(event?.date ? new Date(event.date).toISOString().split('T')[0] : '');
  const [editLoc, setEditLoc] = useState(event?.location || '');
  const [editImg, setEditImg] = useState(event?.imageUrl || '');

  useEffect(() => {
    if (event) {
      setEditTitle(event.title || '');
      setEditDesc(event.description || '');
      setEditDate(event.date ? new Date(event.date).toISOString().split('T')[0] : '');
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

  const handleAISummarize = async () => {
    if (showAISummary) {
      setShowAISummary(false);
      return;
    }
    
    if (aiSummary) {
      setShowAISummary(true);
      return;
    }

    setIsAiLoading(true);
    try {
      const fullText = `Title: ${event.title}\nDescription: ${event.description}\nLocation: ${event.location}\nDate: ${new Date(event.date).toLocaleDateString()}`;
      const { data } = await api.post('/ai/summarize', { text: fullText });
      setAiSummary(data.summary);
      setShowAISummary(true);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to generate AI summary');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEventChat = () => {
    if (event.isPaid) {
      const registration = event.registeredUsers?.find(r => r.user?._id === user._id || r.user === user._id);
      if (!registration || registration.paymentStatus !== 'paid') {
        Alert.alert('Access Denied', 'You must complete the registration and payment to access the event chat.');
        return;
      }
    } else if (!isRegistered) {
      Alert.alert('Access Denied', 'You must register for the event to access the chat.');
      return;
    }
    navigation.navigate('Chat', { roomName: `Event_${event._id}` });
  };

  const handleLeaveRequest = async () => {
    if (!leaveReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation.');
      return;
    }
    try {
      await api.post('/requests/event-leave', { eventId: id, reason: leaveReason });
      Alert.alert('Success', 'Cancellation request submitted successfully! Admin will review it.');
      setIsLeaveModalVisible(false);
      setLeaveReason('');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleRoleSelect = async (role) => {
    if (event.isPaid) {
      setSelectedRole(role);
      setModalStep('payment');
    } else {
      try {
        const { data } = await api.post(`/events/${id}/register`, { role });
        Alert.alert('Success', 'Registered successfully!');
        setIsRoleModalVisible(false);
        // Refetch event to update UI
        const { data: eventData } = await api.get(`/events/${id}`);
        setEvent(eventData);
        setIsRegistered(true);
        
        // Navigate to ticket if QR code is returned
        if (data.qrCode) {
          navigation.navigate('Ticket', { qrCode: data.qrCode, event: { ...eventData, selectedRole: role } });
        }
      } catch (e) {
        Alert.alert('Error', e.response?.data?.message || 'Failed to register');
      }
    }
  };

  const handleConfirmPayment = async () => {
    if (event.isPaid && !paymentId.trim()) {
      Alert.alert('Error', 'Please enter your Payment ID / Transaction ID');
      return;
    }
    try {
      await api.post(`/events/${id}/register`, { role: selectedRole, paymentId });
      Alert.alert('Success', 'Registration submitted! Please wait for admin to verify payment.');
      setIsRoleModalVisible(false);
      setModalStep('choose_role');
      setPaymentId('');
      // Refetch event to update UI
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      setIsRegistered(true);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to register');
    }
  };

  const handleApprovePayment = async (userId) => {
    try {
      await api.post(`/admin/events/${id}/approve-payment`, { userId });
      Alert.alert('Success', 'Payment approved successfully!');
      // Refetch event to update UI
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to approve payment');
    }
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
          <View>
            <View style={styles.statsBox}>
              <Text style={styles.statsTitle}>📊 Registration Stats</Text>
              <Text style={styles.statsText}>Total Registered: {event.registeredUsers?.length || 0}</Text>
              <Text style={styles.statsText}>👥 Participants: {event.registeredUsers?.filter(r => r.role === 'Participant').length || 0}</Text>
              <Text style={styles.statsText}>🎭 Audience: {event.registeredUsers?.filter(r => r.role === 'Audience').length || 0}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Text style={styles.buttonText}>Edit Event Details</Text>
            </TouchableOpacity>
          </View>
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
            {isPaidVerified ? (
              <View>
                <View style={[styles.eligibilityBadge, styles.eligible, {marginBottom: 15}]}>
                  <Text style={styles.eligibilityText}>You are Registered ✓</Text>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Ticket', { event, qrCode: event.registrationQr })}>
                  <Text style={styles.buttonText}>🎟️ View Ticket</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={[styles.eligibilityBadge, { backgroundColor: '#ffeb3b', marginBottom: 15, alignItems: 'center' }]}>
                  <Text style={{ color: '#000', fontWeight: 'bold' }}>⏳ Registration & Payment Pending</Text>
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentText}>💰 Complete Your Payment: ₹{event.price}</Text>
                  <Text style={styles.paymentSubtext}>Please scan the UPI QR below to pay. Your registration will be confirmed once the admin verifies the payment.</Text>
                  
                  {event.paymentQr ? (
                    <>
                      <Image source={{ uri: event.paymentQr }} style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: 10, borderRadius: 8 }} />
                      <TouchableOpacity 
                        style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10, width: '80%', alignSelf: 'center' }} 
                        onPress={() => Linking.openURL(event.upiUri).catch(err => Alert.alert('Error', 'Could not open payment app'))}
                      >
                        <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Pay via UPI App</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.mockQrBox}>
                      <Text style={styles.mockQrText}>[ Mock UPI QR Code ]</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEventChat}>
              <Text style={styles.secondaryButtonText}>💬 Join Event Chat Group</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryButton, { marginTop: 10, borderColor: COLORS.error }]} onPress={() => setIsLeaveModalVisible(true)}>
              <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>🚪 Request to Cancel Registration</Text>
            </TouchableOpacity>
          </View>
        )}

        {showAISummary && (
          <View style={styles.aiSummaryBox}>
            <Text style={styles.aiSummaryTitle}>🤖 AI Smart Summary</Text>
            {isAiLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.aiSummaryText}>{aiSummary}</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={[styles.secondaryButton, {marginTop: 10}]} onPress={handleAISummarize}>
          <Text style={styles.secondaryButtonText}>{showAISummary ? 'Hide AI Summary' : '🤖 Smart AI Summary'}</Text>
        </TouchableOpacity>

        {user?.role === 'admin' && (
          <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 10 }}>Admin: Registered Users</Text>
            {event.registeredUsers?.length === 0 ? (
              <Text style={{ color: COLORS.textLight }}>No users registered yet.</Text>
            ) : (
              event.registeredUsers?.map(r => (
                <View key={r.user?._id} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' }}>
                  <Text style={{ fontWeight: 'bold' }}>{r.user?.name || 'Unknown'}</Text>
                  <Text>Role: {r.role}</Text>
                  <Text>Status: {r.paymentStatus}</Text>
                  {r.paymentId && <Text style={{ color: COLORS.primary, fontWeight: '500' }}>Payment ID: {r.paymentId}</Text>}
                  
                  {r.paymentStatus === 'pending' && (
                    <TouchableOpacity 
                      style={{ backgroundColor: COLORS.primary, padding: 8, borderRadius: 5, marginTop: 5, alignItems: 'center' }}
                      onPress={() => handleApprovePayment(r.user?._id)}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Approve Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
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
            
              {modalStep === 'choose_role' ? (
                <>
                  <TouchableOpacity 
                    style={[styles.roleBtn, { backgroundColor: COLORS.primary }]} 
                    onPress={() => handleRoleSelect('Participant')}
                  >
                    <Text style={styles.roleBtnText}>Register as Participant</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.roleBtn, { backgroundColor: COLORS.secondary, marginTop: 10 }]} 
                    onPress={() => handleRoleSelect('Audience')}
                  >
                    <Text style={styles.roleBtnText}>Register as Audience</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View>
                  <Text style={[styles.text, { textAlign: 'center', marginBottom: 15 }]}>
                    Please pay <Text style={{fontWeight: 'bold'}}>₹{event.price}</Text> to complete your registration as <Text style={{fontWeight: 'bold'}}>{selectedRole}</Text>.
                  </Text>
                  
                  {event.paymentQr ? (
                    <Image source={{ uri: event.paymentQr }} style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: 15, borderRadius: 8 }} />
                  ) : (
                    <View style={[styles.mockQrBox, { marginBottom: 15 }]}>
                      <Text style={styles.mockQrText}>[ Mock UPI QR Code ]</Text>
                    </View>
                  )}

                  <TextInput 
                    style={[styles.input, { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white }]} 
                    placeholder="Enter Payment ID / Transaction ID *" 
                    value={paymentId} 
                    onChangeText={setPaymentId} 
                  />
                  
                  <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.primary }]} onPress={handleConfirmPayment}>
                    <Text style={styles.submitBtnText}>I Have Paid</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsRoleModalVisible(false); setModalStep('choose_role'); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Leave Request Modal */}
      <Modal visible={isLeaveModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request to Cancel Registration</Text>
            <Text style={styles.text}>Please state the reason for canceling your registration for this event.</Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top', marginTop: 15 }]} 
              placeholder="Reason for cancellation..." 
              value={leaveReason} 
              onChangeText={setLeaveReason}
              multiline
            />
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.error }]} onPress={handleLeaveRequest}>
              <Text style={styles.submitBtnText}>Submit Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsLeaveModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
  statsBox: { backgroundColor: '#e2e3e5', padding: 15, borderRadius: 8, marginBottom: 15 },
  statsTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 8 },
  statsText: { fontSize: 14, color: COLORS.textMain, marginBottom: 4 },
  
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
