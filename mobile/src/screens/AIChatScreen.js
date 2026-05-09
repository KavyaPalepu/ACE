import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import api from '../api';
import { COLORS } from '../theme/colors';

export default function AIChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: 'Hello! I am the ACE Assistant. I can help you summarize events, find clubs, or give you exam info.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { sender: 'User', text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { prompt: userMsg.text });
      setMessages((prev) => [...prev, { sender: 'AI', text: data.reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { sender: 'AI', text: 'Sorry, I am having trouble connecting to the server.' }]);
    }
    
    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const isAI = item.sender === 'AI';
    return (
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.text, isAI ? styles.aiText : styles.userText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACE Assistant</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
      />

      {loading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginBottom: 10 }} />}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: 50, backgroundColor: COLORS.darkNavy },
  backBtn: { marginRight: 15 },
  backText: { color: COLORS.white, fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  list: { padding: 15 },
  bubble: { maxWidth: '85%', padding: 15, borderRadius: 16, marginBottom: 12 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiText: { color: COLORS.textMain, fontSize: 16, lineHeight: 22 },
  userText: { color: COLORS.white, fontSize: 16, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', padding: 10, paddingBottom: 30, backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendBtn: { backgroundColor: COLORS.darkNavy, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: COLORS.white, fontWeight: 'bold' }
});
