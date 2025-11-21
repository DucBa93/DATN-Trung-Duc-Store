const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat", // Model miễn phí
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error("🔥 Chatbot error:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;
