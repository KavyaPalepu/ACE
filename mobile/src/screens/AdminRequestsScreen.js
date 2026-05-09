import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import api from '../api';

export default function AdminRequestsScreen() {
  const [requests, setRequests] = useState({ emailRequests: [], clubRequests: [], eventRequests: [] });
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/admin/all');
      setRequests(data);
    } catch (error) {
      console.log('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (type, id, status) => {
    try {
      await api.put(`/requests/admin/${type}/${id}`, { status });
      Alert.alert('Success', `Request ${status} successfully!`);
      fetchRequests(); // Refresh
    } catch (error) {
      Alert.alert('Error', 'Failed to update request');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  const renderRequestCard = (item, type) => (
    <View key={item._id} style={styles.card}>
      <Text style={styles.userName}>{item.userId?.name} ({item.userId?.email})</Text>
      
      {type === 'email' && (
        <Text style={styles.requestDetail}>Wants to change email to: <Text style={styles.bold}>{item.newEmail}</Text></Text>
      )}
      {type === 'club' && (
        <Text style={styles.requestDetail}>Wants to leave club: <Text style={styles.bold}>{item.clubId?.name}</Text></Text>
      )}
      {type === 'event' && (
        <Text style={styles.requestDetail}>Wants to cancel registration for: <Text style={styles.bold}>{item.eventId?.title}</Text></Text>
      )}
      
      <Text style={styles.reason}>Reason: "{item.reason}"</Text>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleAction(type, item._id, 'approved')}>
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleAction(type, item._id, 'rejected')}>
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Email Change Requests ({requests.emailRequests.length})</Text>
      {requests.emailRequests.length === 0 ? <Text style={styles.empty}>No pending email requests.</Text> : 
        requests.emailRequests.map(item => renderRequestCard(item, 'email'))}

      <Text style={styles.sectionTitle}>Club Leave Requests ({requests.clubRequests.length})</Text>
      {requests.clubRequests.length === 0 ? <Text style={styles.empty}>No pending club requests.</Text> : 
        requests.clubRequests.map(item => renderRequestCard(item, 'club'))}

      <Text style={styles.sectionTitle}>Event Cancel Requests ({requests.eventRequests.length})</Text>
      {requests.eventRequests.length === 0 ? <Text style={styles.empty}>No pending event requests.</Text> : 
        requests.eventRequests.map(item => renderRequestCard(item, 'event'))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy, marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  userName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
  requestDetail: { fontSize: 14, color: COLORS.textMain, marginTop: 5 },
  bold: { fontWeight: 'bold', color: COLORS.primary },
  reason: { fontSize: 14, color: COLORS.textLight, marginTop: 5, fontStyle: 'italic' },
  buttonGroup: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5, marginLeft: 10 },
  approveBtn: { backgroundColor: COLORS.primary },
  rejectBtn: { backgroundColor: COLORS.error },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  empty: { color: COLORS.textLight, fontStyle: 'italic', marginLeft: 5 }
});
