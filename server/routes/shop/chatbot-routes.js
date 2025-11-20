const express = require("express");
const router = express.Router();
const axios = require("axios");

// API key OpenAI của bạn
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      reply: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.error("Chatbot error:", err.response?.data || err.message);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;
