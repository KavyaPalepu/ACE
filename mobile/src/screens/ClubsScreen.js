import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';
import api from '../api';

const CustomImage = ({ uri, style }) => {
  const [error, setError] = useState(false);
  const fallback = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500';
  
  return (
    <Image 
      source={{ uri: error ? fallback : (uri || fallback) }} 
      style={style} 
      onError={() => setError(true)} 
    />
  );
};

export default function ClubsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchClubs = async () => {
    try {
      const { data } = await api.get('/clubs');
      setClubs(data);
    } catch (e) {
      console.log('Error fetching clubs:', e);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchClubs();
    }, [])
  );

  const handleMoreDetails = (clubId) => {
    navigation.navigate('ClubDetails', { clubId });
  };

  const handleDeleteClub = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this club?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await api.delete(`/clubs/${id}`);
              Alert.alert('Success', 'Club deleted successfully!');
              fetchClubs();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete club');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isMember = item.members.includes(user?._id);

    return (
      <View style={styles.card}>
        <CustomImage uri={item.imageUrl} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
        
        {isMember ? (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: COLORS.secondary }]}
            onPress={() => handleMoreDetails(item._id)}
          >
            <Text style={styles.buttonText}>Joined ✓ (View Details & Chat)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleMoreDetails(item._id)}
          >
            <Text style={styles.buttonText}>More Details</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'admin' && (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: COLORS.error, marginTop: 10 }]}
            onPress={() => handleDeleteClub(item._id)}
          >
            <Text style={styles.buttonText}>Delete Club</Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={{ padding: 15, backgroundColor: COLORS.white }}>
        <TextInput
          style={styles.searchBar}
          placeholder="🔍 Search clubs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredClubs}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No clubs available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
  searchBar: { backgroundColor: '#F1F5F9', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 16, shadowColor: COLORS.darkNavy, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 20 }
});
