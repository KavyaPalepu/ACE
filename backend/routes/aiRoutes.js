const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Real AI Chatbot Endpoint
router.post('/chat', protect, async (req, res) => {
  if (!ai) {
    return res.status(500).json({ message: 'Gemini API key is not configured on server' });
  }
  
  const { prompt } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the ACE Assistant, a helpful AI assistant for a college communication platform. Help students find info about events, clubs, and general campus life.\n\nUser Question: ${prompt}`,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Failed to generate AI response' });
  }
});

// AI Summarize Endpoint
router.post('/summarize', protect, async (req, res) => {
  if (!ai) {
    return res.status(500).json({ message: 'Gemini API key is not configured on server' });
  }

  const { text } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please summarize the following event details in 2-3 sentences:\n\n${text}`,
    });

    res.json({ summary: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

module.exports = router;
