const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// 🔑 Lấy API KEY từ Render environment
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Gọi OpenAI chat API
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Model rẻ và tốt
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;
