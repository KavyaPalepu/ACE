import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image, Linking, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';
import api from '../api';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [pastEvents, setPastEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPastEvents = pastEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchEvents = async () => {
    try {
      const upcomingRes = await api.get('/events?type=upcoming');
      setEvents(upcomingRes.data);
      
      const pastRes = await api.get('/events?type=past');
      setPastEvents(pastRes.data);
    } catch (e) {
      console.log('Error fetching events:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleDeleteEvent = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await api.delete(`/events/${id}`);
              Alert.alert('Success', 'Event deleted successfully!');
              fetchEvents();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.name || 'Student'}!</Text>
          <Text style={styles.subtitle}>{user?.department || 'General'} Department</Text>
        </View>

        <View style={{ padding: 15 }}>
          <TextInput
            style={styles.searchBar}
            placeholder="🔍 Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {filteredEvents.length === 0 ? (
          <Text style={styles.emptyText}>No events match your search.</Text>
        ) : (
          filteredEvents.map((event) => (
            <View key={event._id} style={styles.card}>
              {event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardText}>{new Date(event.date).toLocaleDateString()} - {event.location}</Text>
                <Text style={styles.registeredText}>👥 {event.registeredUsers?.length || 0} Students Registered</Text>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('EventDetails', { event })}
                >
                  <Text style={styles.buttonText}>
                    {user?.role === 'admin' ? 'View Details' : 'View Details & Register'}
                  </Text>
                </TouchableOpacity>

                {user?.role === 'admin' && (
                  <TouchableOpacity 
                    style={[styles.outlineButton, { borderColor: COLORS.error, marginTop: 10 }]}
                    onPress={() => handleDeleteEvent(event._id)}
                  >
                    <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Delete Event</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Events</Text>
        {filteredPastEvents.length === 0 ? (
          <Text style={styles.emptyText}>No past events match your search.</Text>
        ) : (
          filteredPastEvents.map((event) => (
            <View key={event._id} style={styles.pastCard}>
              {event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.pastImage} />}
              <View style={styles.pastContent}>
                <Text style={styles.pastTitle}>{event.title}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(event.driveLink || 'https://drive.google.com')}>
                  <Text style={styles.driveLink}>📁 Download Photos (Drive)</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

        </ScrollView>

        {/* Sticky AI FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AIChat')}>
          <Text style={styles.fabText}>AI</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, backgroundColor: COLORS.darkNavy, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 16, color: COLORS.primary, marginTop: 4 },
  logoutBtn: { position: 'absolute', right: 20, top: 24, backgroundColor: COLORS.error, padding: 8, borderRadius: 5 },
  logoutText: { color: COLORS.white, fontWeight: 'bold' },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 12 },
  emptyText: { color: COLORS.textLight, fontStyle: 'italic' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 15, shadowColor: COLORS.darkNavy, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 8 },
  cardText: { fontSize: 14, color: COLORS.textMain, marginBottom: 8 },
  registeredText: { fontSize: 14, color: COLORS.secondary, fontWeight: 'bold', marginBottom: 16 },
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  outlineButton: { borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  outlineButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: COLORS.secondary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
  fabText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
  searchBar: { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  pastCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  pastImage: { width: 100, height: 80 },
  pastContent: { flex: 1, padding: 12, justifyContent: 'center' },
  pastTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 4 },
  driveLink: { fontSize: 14, color: COLORS.primary, fontWeight: '500' }
});
