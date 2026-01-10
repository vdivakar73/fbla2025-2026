import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, contentSummaryPrompt } from 'prompts.js';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: contentSummaryPrompt(text) }
      ],
      temperature: 0.25
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI failed' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
