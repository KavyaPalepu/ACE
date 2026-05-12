import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image, Linking, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';
import api from '../api';

const CustomImage = ({ uri, style }) => {
  const [error, setError] = useState(false);
  const fallback = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500';
  
  return (
    <Image 
      source={{ uri: error ? fallback : (uri || fallback) }} 
      style={style} 
      onError={() => setError(true)} 
    />
  );
};

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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {filteredEvents.map((event) => (
                <TouchableOpacity 
                  key={event._id} 
                  style={styles.carouselCard}
                  onPress={() => navigation.navigate('EventDetails', { event })}
                >
                  <CustomImage uri={event.imageUrl} style={styles.carouselImage} />
                  <View style={styles.carouselOverlay}>
                    <Text style={styles.carouselTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.carouselText}>{new Date(event.date).toLocaleDateString()} • {event.location}</Text>
                    <Text style={styles.carouselBadge}>👥 {event.registeredUsers?.length || 0} Registered</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Events</Text>
          {filteredPastEvents.length === 0 ? (
            <Text style={styles.emptyText}>No past events match your search.</Text>
          ) : (
            filteredPastEvents.map((event) => (
              <View key={event._id} style={styles.pastCard}>
                <CustomImage uri={event.imageUrl} style={styles.pastImage} />
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
  header: { padding: 24, backgroundColor: COLORS.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginTop: 4, letterSpacing: 0.5 },
  section: { marginTop: 25, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginBottom: 16, letterSpacing: 0.5 },
  emptyText: { color: COLORS.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  
  // Carousel Card
  carouselCard: { width: 280, backgroundColor: COLORS.white, borderRadius: 20, marginRight: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  carouselImage: { width: '100%', height: 150 },
  carouselOverlay: { padding: 16 },
  carouselTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 4 },
  carouselText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 8 },
  carouselBadge: { fontSize: 12, color: COLORS.textLight, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  
  deleteMiniBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  deleteMiniBtnText: { color: COLORS.error, fontSize: 11, fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  fabText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  
  searchBar: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, shadowColor: '#000', shadowOpacity: 0.03, elevation: 2 },
  
  pastCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  pastImage: { width: 80, height: 80 },
  pastContent: { flex: 1, padding: 12, justifyContent: 'center' },
  pastTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 4 },
  driveLink: { fontSize: 12, color: COLORS.primary, fontWeight: '600' }
});
