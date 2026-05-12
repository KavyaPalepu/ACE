import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Modal, TextInput } from 'react-native';
import { COLORS } from '../theme/colors';
import api from '../api';
import { AuthContext } from '../store/AuthContext';

export default function ClubDetailsScreen({ route, navigation }) {
  const { clubId } = route.params;
  const { user } = useContext(AuthContext);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Leave Request state
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImg, setEditImg] = useState('');

  useEffect(() => {
    if (club) {
      setEditName(club.name);
      setEditDesc(club.description);
      setEditImg(club.imageUrl);
    }
  }, [club]);

  const handleUpdateClub = async () => {
    try {
      await api.put(`/clubs/${clubId}`, {
        name: editName,
        description: editDesc,
        imageUrl: editImg
      });
      Alert.alert('Success', 'Club updated successfully!');
      setIsEditModalVisible(false);
      fetchClubDetails(); // Refresh
    } catch (e) {
      Alert.alert('Error', 'Failed to update club');
    }
  };

  const handleLeaveRequest = async () => {
    if (!leaveReason) {
      Alert.alert('Error', 'Please provide a reason.');
      return;
    }
    try {
      await api.post('/requests/club-leave', { clubId, reason: leaveReason });
      Alert.alert('Success', 'Leave request submitted successfully! Admin will review it.');
      setIsLeaveModalVisible(false);
      setLeaveReason('');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit request');
    }
  };

  const fetchClubDetails = async () => {
    try {
      // In a real app we might fetch the specific club from /clubs/:id, 
      // but for now we fetch all and filter or assume backend supports /clubs/:id
      const { data } = await api.get(`/clubs/${clubId}`);
      setClub(data);
    } catch (e) {
      console.log('Error fetching club details:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  const handleAISummarize = async () => {
    if (showAISummary) {
      setShowAISummary(false);
      return;
    }

    setShowAISummary(true);
    if (aiSummary) return; // Don't fetch again

    setIsAiLoading(true);
    try {
      const { data } = await api.post('/ai/summarize', {
        text: `Club Name: ${club.name}\nDescription: ${club.description}`
      });
      setAiSummary(data.summary);
    } catch (e) {
      setAiSummary('Failed to generate AI summary.');
    }
    setIsAiLoading(false);
  };

  const handleJoinClub = async () => {
    try {
      await api.post(`/clubs/${clubId}/join`, {});
      Alert.alert('Success', 'Successfully joined the club!');
      fetchClubDetails();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Error joining club');
    }
  };

  const handleClubChat = () => {
    navigation.navigate('Chat', { roomName: `Club_${clubId}` });
  };

  const handleBookSlot = async (slotIndex) => {
    if (!isMember) {
      Alert.alert('Access Denied', 'Please join the club first before booking a slot.');
      return;
    }
    try {
      await api.post(`/clubs/${clubId}/join`, { slotIndex });
      Alert.alert('Success', 'Successfully booked the slot!');
      fetchClubDetails(); // Refresh to show joined status
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Error booking slot');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  if (!club) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Club not found.</Text>
      </View>
    );
  }

  const isMember = club.members.includes(user?._id);

  return (
    <ScrollView style={styles.container}>
      {club.imageUrl && <Image source={{ uri: club.imageUrl }} style={styles.headerImage} />}
      <View style={styles.header}>
        <Text style={styles.title}>{club.name}</Text>
        <Text style={styles.description}>{club.description}</Text>
        {isMember && (
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>You are a member ✓</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        {user?.role === 'admin' && (
          <TouchableOpacity style={[styles.button, { marginBottom: 15 }]} onPress={() => setIsEditModalVisible(true)}>
            <Text style={styles.buttonText}>Edit Club Details</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleAISummarize}>
          <Text style={styles.secondaryButtonText}>{showAISummary ? 'Hide AI Summary' : '🤖 Smart AI Summary'}</Text>
        </TouchableOpacity>

        {!isMember && user?.role !== 'admin' && (
          <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleJoinClub}>
            <Text style={styles.buttonText}>Join Club</Text>
          </TouchableOpacity>
        )}

        {showAISummary && (
          <View style={styles.aiSummaryBox}>
            <Text style={styles.aiSummaryTitle}>🤖 Club AI Summary</Text>
            {isAiLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.aiSummaryText}>{aiSummary}</Text>
            )}
          </View>
        )}

        {isMember && (
          <>
            <TouchableOpacity style={[styles.secondaryButton, { marginTop: 10, borderColor: COLORS.secondary }]} onPress={handleClubChat}>
              <Text style={[styles.secondaryButtonText, { color: COLORS.secondary }]}>💬 Join Club Chat Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.secondaryButton, { marginTop: 10, borderColor: COLORS.error }]} onPress={() => setIsLeaveModalVisible(true)}>
              <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>🚪 Request to Leave Club</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Slots / Events</Text>
        {club.availableSlots && club.availableSlots.length > 0 ? (
          club.availableSlots.map((slot, index) => {
            const isBookedByUser = slot.bookedBy.includes(user?._id);
            const isFull = slot.bookedBy.length >= slot.capacity;

            return (
              <View key={index} style={styles.slotCard}>
                <Text style={styles.slotTime}>{slot.time}</Text>
                <Text style={styles.slotCapacity}>
                  {slot.bookedBy.length} / {slot.capacity} Booked
                </Text>
                {isBookedByUser ? (
                  <View style={[styles.button, { backgroundColor: COLORS.secondary }]}>
                    <Text style={styles.buttonText}>Slot Booked ✓</Text>
                  </View>
                ) : isFull ? (
                  <View style={[styles.button, { backgroundColor: COLORS.textLight }]}>
                    <Text style={styles.buttonText}>Full</Text>
                  </View>
                ) : (
                  user?.role === 'admin' ? (
                    <View style={[styles.button, { backgroundColor: COLORS.textLight }]}>
                      <Text style={styles.buttonText}>Available to Students</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={() => handleBookSlot(index)}
                    >
                      <Text style={styles.buttonText}>Book Slot</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.empty}>No slots currently available.</Text>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLeaveModalVisible}
        onRequestClose={() => setIsLeaveModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request to Leave Club</Text>
            
            <Text style={styles.label}>Reason for Leaving</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={leaveReason} 
              onChangeText={setLeaveReason} 
              multiline
              placeholder="Please explain why you want to leave..."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.textLight }]} onPress={() => setIsLeaveModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.error }]} onPress={handleLeaveRequest}>
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Club Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Club Details</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Club Name *" value={editName} onChangeText={setEditName} />
              <TextInput style={styles.input} placeholder="Description *" value={editDesc} onChangeText={setEditDesc} multiline />
              <TextInput style={styles.input} placeholder="Logo/Image URL" value={editImg} onChangeText={setEditImg} />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.textLight }]} onPress={() => setIsEditModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={handleUpdateClub}>
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
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
  description: { fontSize: 16, color: COLORS.textMain, lineHeight: 24 },
  memberBadge: { marginTop: 16, backgroundColor: COLORS.secondary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start' },
  memberText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 16 },
  slotCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  slotTime: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  slotCapacity: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  empty: { color: COLORS.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  secondaryButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  aiSummaryBox: { backgroundColor: '#eef', padding: 15, borderRadius: 8, marginTop: 15, borderWidth: 1, borderColor: COLORS.primary },
  aiSummaryTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 8 },
  aiSummaryText: { fontSize: 14, color: COLORS.textMain, lineHeight: 20 },
  
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: COLORS.white, padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5 },
  input: { backgroundColor: COLORS.background, padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 14 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.45, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: COLORS.white, fontWeight: 'bold' }
});
