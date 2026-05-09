import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import api from '../api';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Create backend route for this later, falling back to empty for now
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (e) {
      console.log('Error fetching notifications:', e);
      setNotifications([]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handlePress = (item) => {
    if (item.type === 'event' && item.relatedId) {
      navigation.navigate('EventDetails', { eventId: item.relatedId });
    } else if (item.type === 'club' && item.relatedId) {
      navigation.navigate('ClubDetails', { clubId: item.relatedId });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{new Date(item.createdAt || item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <View style={[styles.badge, item.type === 'exam' ? styles.badgeExam : styles.badgeReminder]}>
        <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No notifications right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkNavy, flex: 1 },
  date: { fontSize: 12, color: COLORS.textLight, marginLeft: 8 },
  message: { fontSize: 14, color: COLORS.textMain, marginBottom: 12 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, alignSelf: 'flex-start' },
  badgeExam: { backgroundColor: COLORS.error },
  badgeReminder: { backgroundColor: COLORS.primary },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 20 }
});
