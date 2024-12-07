const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const path = require("path");
const { createClient } = require("@deepgram/sdk");
require('dotenv').config();
const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(cors());
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.post("/generate", async (req, res) => {
  const { userInput } = req.body;
  if (!userInput) {
    return res.status(400).json({ error: "No input provided." });
  }
  try {
    start = performance.now();
    const completion = await groq.chat.completions
    .create({
      messages: [
        { role: "system", content: "You are a helpful call assistance. give output short and consize in 25 words." },
        {
          role: "user",
          content: userInput,
        },
      ],
      model: "llama3-8b-8192",
    });
    end = performance.now();
    const assistantMessage = completion.choices[0].message.content.trim();
    res.json({ response: assistantMessage, time: end - start });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generating response." });
  }
});
app.post("/generate-audio", async (req, res) => {
    const text = req.body.text;
    if (!text) {
      return res.status(400).send("No text provided.");
    }
  
    try {
      const response = await deepgram.speak.request(
        { text },
        {
          model: "aura-asteria-en",
          encoding: "linear16",
          container: "wav",
        }
      );
  
      const stream = await response.getStream();
  
      if (stream) {
        // Set the headers for a WAV file
        res.setHeader("Content-Type", "audio/wav");
        for await (const chunk of stream) {
          res.write(chunk);
        }
        res.end();
      } else {
        res.status(500).send("Error generating audio.");
      }
    } catch (err) {
      console.error("Error generating audio:", err);
      res.status(500).send("An error occurred while generating audio.");
    }
  });
  
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});