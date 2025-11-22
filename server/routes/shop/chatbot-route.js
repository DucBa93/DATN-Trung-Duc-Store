const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://router.huggingface.co/models/google/gemma-2b-it",
      { inputs: message },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data?.[0]?.generated_text || "Model không trả lời.";

    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;
