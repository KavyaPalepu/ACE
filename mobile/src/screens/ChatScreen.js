import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { AuthContext } from '../store/AuthContext';
import { COLORS } from '../theme/colors';

// Ensure this matches your backend API_URL base
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://grapple-kilobyte-worry.ngrok-free.dev';

export default function ChatScreen({ route }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);

  const roomName = route.params?.roomName || (user?.department ? `${user.department}_General` : 'Global_Chat');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('joinRoom', roomName);

    newSocket.on('chatHistory', (history) => {
      setMessages(history);
    });

    newSocket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.disconnect();
  }, [roomName]);

  const sendMessage = () => {
    if (inputText.trim() && socket) {
      const msgData = {
        room: roomName,
        senderName: user?.name || 'Student',
        text: inputText,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      socket.emit('sendMessage', msgData);
      setInputText('');
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderName === user?.name;
    return (
      <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
        {!isMine && <Text style={styles.senderName}>{item.senderName}</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{roomName.replace('_', ' ')}</Text>
      </View>
      
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
      />

      <SafeAreaView style={{ backgroundColor: COLORS.white }}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  header: { padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkNavy, textAlign: 'center' },
  chatList: { padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 8, marginBottom: 10 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  senderName: { fontSize: 12, color: COLORS.primary, marginBottom: 4, fontWeight: 'bold' },
  messageText: { fontSize: 16, color: '#303030' },
  timeText: { fontSize: 10, color: COLORS.textLight, alignSelf: 'flex-end', marginTop: 4 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendBtn: { backgroundColor: COLORS.secondary, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: COLORS.white, fontWeight: 'bold' }
});
