require('dotenv').config();
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const SYSTEM = fs.readFileSync('prompts/v2.txt', 'utf8');
const MODEL = process.env.MODEL || 'openai/gpt-oss-120b';
const BACKUP_MODEL = process.env.BACKUP_MODEL || 'qwen/qwen3.8-27b';

const STEP_RULES = {
  question: 'Current step: QUESTION. Ask one follow up that helps the student separate what they know from what they assume, then what they predict. Do not suggest an experiment yet.',
  experiment: 'Current step: EXPERIMENT. Propose ONE small, safe, cheap test using things a student likely has, and say exactly what to measure.',
  reflect: 'Current step: REFLECT. In one sentence say what you noticed in the result, then ask ONE next question.'
};

async function callModel(model, messages) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, max_tokens: 400, temperature: 0.4 })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const text = data.choices[0].message.content;
    if (!text) throw new Error('Empty reply');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

app.post('/chat', async (req, res) => {
  const { step, scenario, history } = req.body || {};
  if (!STEP_RULES[step] || !Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid step or history.' });
  }
  const clean = history
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-10);
  const last = clean[clean.length - 1];
  if (!last || last.role !== 'user' || !last.content.trim()) {
    return res.status(400).json({ error: 'Please type something first.' });
  }
  const messages = [
    { role: 'system', content: `${SYSTEM}\n\nScenario: ${scenario || 'none'}\n${STEP_RULES[step]}` },
    ...clean
  ];
  try {
    let reply;
    try {
      reply = await callModel(MODEL, messages);
    } catch (e) {
      console.error('Primary failed:', e.message);
      reply = await callModel(BACKUP_MODEL, messages);
    }
    res.json({ reply });
  } catch (e) {
    console.error('Backup failed:', e.message);
    res.status(502).json({ error: 'The AI is busy right now. Please try again.' });
  }
});

app.listen(3000, () => console.log('WonderLab running on http://localhost:3000'));