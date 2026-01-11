import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const { prompt } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  res.json({ output: data.choices[0].message.content });
});

app.listen(3000, () => console.log("AI server running on port 3000"));
