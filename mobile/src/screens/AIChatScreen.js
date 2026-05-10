import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';

import api from '../api';
import { COLORS } from '../theme/colors';

export default function AIChatScreen({ navigation }) {

  const flatListRef = useRef();

  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text:
        'Hi! I am ACE Assistant 👋\n\n' +
        'I can help you with:\n' +
        '• Events\n' +
        '• Clubs\n' +
        '• Exams\n' +
        '• Placements\n' +
        '• Academic Guidance'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {

    if (!inputText.trim() || loading) return;

    const userMessage = {
      sender: 'User',
      text: inputText
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {

      const { data } = await api.post('/ai/chat', {
        prompt: inputText,
        history: updatedMessages
      });

      const aiMessage = {
        sender: 'AI',
        text: data.reply
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text:
            'Unable to contact AI assistant right now. Please try again.'
        }
      ]);
    }

    setLoading(false);
  };

  const renderMessage = ({ item }) => {

    const isAI = item.sender === 'AI';

    return (
      <View
        style={[
          styles.bubble,
          isAI ? styles.aiBubble : styles.userBubble
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isAI ? styles.aiText : styles.userText
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* Header */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          ACE Assistant
        </Text>

      </View>

      {/* Suggestions */}

      <View style={styles.suggestionContainer}>

        <Text style={styles.suggestionTitle}>
          Suggested Questions
        </Text>

        <View style={styles.suggestionRow}>
          <Text style={styles.suggestion}>
            • Upcoming events?
          </Text>

          <Text style={styles.suggestion}>
            • Recommend clubs
          </Text>
        </View>

        <View style={styles.suggestionRow}>
          <Text style={styles.suggestion}>
            • Exam tips
          </Text>

          <Text style={styles.suggestion}>
            • Placement help
          </Text>
        </View>

      </View>

      {/* Messages */}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({
            animated: true
          })
        }
      />

      {/* Typing */}

      {loading && (
        <View style={styles.typingContainer}>
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
          />

          <Text style={styles.typingText}>
            ACE Assistant is typing...
          </Text>
        </View>
      )}

      {/* Input */}

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendText}>
            Send
          </Text>
        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: COLORS.darkNavy
  },

  backBtn: {
    marginRight: 15
  },

  backText: {
    color: COLORS.white,
    fontSize: 16
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white
  },

  suggestionContainer: {
    padding: 15,
    backgroundColor: COLORS.white
  },

  suggestionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.textMain
  },

  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },

  suggestion: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    color: COLORS.darkNavy,
    fontSize: 13
  },

  list: {
    padding: 15
  },

  bubble: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 18,
    marginBottom: 12
  },

  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    elevation: 2
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22
  },

  aiText: {
    color: COLORS.textMain
  },

  userText: {
    color: COLORS.white
  },

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 10
  },

  typingText: {
    marginLeft: 10,
    color: COLORS.textSecondary
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: '#eee'
  },

  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100
  },

  sendBtn: {
    backgroundColor: COLORS.darkNavy,
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },

  sendText: {
    color: COLORS.white,
    fontWeight: 'bold'
  }
});
