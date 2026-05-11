import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';
import api from '../api';

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
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}
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
  searchBar: { backgroundColor: COLORS.background, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 16, shadowColor: COLORS.darkNavy, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy, marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 20 }
});
