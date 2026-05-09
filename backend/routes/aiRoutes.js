const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock AI Chatbot Endpoint
router.post('/chat', protect, async (req, res) => {
  const { prompt } = req.body;
  
  // This is a mocked realistic response. 
  // In production, you would call OpenAI: openai.createChatCompletion({...})
  
  let aiResponse = "I'm the ACE Assistant! I can help you summarize events or find clubs.";
  
  if (prompt.toLowerCase().includes("summarize")) {
    aiResponse = "**Summary**: The upcoming event requires registration via the Events tab. Ensure you belong to the correct department before applying. You will receive a QR code upon success.";
  } else if (prompt.toLowerCase().includes("exam")) {
    aiResponse = "Exams for the Computer Science department start next Monday. Please check the Notifications tab for the detailed schedule.";
  } else if (prompt.toLowerCase().includes("club")) {
    aiResponse = "To join a club, head to the Clubs tab, view the details, and book an available time slot. You'll be automatically added to the club's group chat!";
  } else {
    aiResponse = `You asked: "${prompt}". \n\nAs an AI assistant for the College Platform, I recommend checking the Notifications tab for the latest updates!`;
  }

  // Simulate network delay for AI processing
  setTimeout(() => {
    res.json({ reply: aiResponse });
  }, 1000);
});

module.exports = router;
