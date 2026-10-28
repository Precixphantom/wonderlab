require('dotenv').config(); // why: loads the keys from .env into process.env so they never sit in the code
const express = require('express'); // why: the web server library
const fs = require('fs'); // why: needed to read the system prompt file

const app = express(); // why: creates the server
app.use(express.json()); // why: lets the server read JSON sent by the browser
app.use(express.static('public')); // why: serves index.html from the public folder

const PORT = process.env.PORT || 3000; // why: hosting services pick the port for you, and 3000 is the fallback on your laptop

const SYSTEM = fs.readFileSync('prompts/v5.txt', 'utf8'); // why: loads the current system prompt once at startup
const MODEL = { model: process.env.MODEL || 'google/gemma-4-26b-a4b-it', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPENROUTER_API_KEY }; // why: the primary model, with its own host and key
const BACKUP_MODEL = { model: process.env.BACKUP_MODEL || 'openai/gpt-oss-120b', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY }; // why: the backup is on a different host, so one outage cannot take both down

const UNSAFE = /\b(petrol|gasoline|kerosene|lighter|flame|fire|explode|explosive|acid|bleach|poison)\b/i; // why: a blunt list of clearly dangerous words, checked in code because the model only avoids them most of the time

const STEP_RULES = { // why: tells the model which stage of the journey it is on
    question: 'Current step: QUESTION. Give one short clue, then ask one easy question that uses it. Follow the hint at the end of the student message. Do not suggest an experiment yet.',
    experiment: 'Current step: EXPERIMENT. Propose ONE safe observation test that checks the student\'s own prediction, based on observing, counting, timing or comparing. In 2 to 4 short sentences say what to look at or count, where and when, and what result would support their prediction. Tell them to observe from a safe place away from roads and crowds. It must need no special tools. Do not ask any question in this step.',
    reflect: 'Current step: REFLECT. In one sentence say what the student noticed and whether it matched their earlier prediction. Only use details the student actually wrote. Then ask ONE next question that nudges them toward improving it.',
};

async function callModel(cfg, messages) { // why: cfg is the whole object (name, host, key) for whichever model we are calling
  const controller = new AbortController(); // why: lets us cancel a request that takes too long
  const timer = setTimeout(() => controller.abort(), 20000); // why: give up after 20 seconds so the student is not left waiting
  try { // why: the finally block below must always run
    const res = await fetch(cfg.url, { // why: each model has its own host address
      method: 'POST', // why: chat completions are sent as POST
      signal: controller.signal, // why: connects the timeout to this request
      headers: { // why: the host needs to know who we are and what we are sending
        Authorization: `Bearer ${cfg.key}`, // why: the key for this specific host, not a shared one
        'Content-Type': 'application/json' // why: we are sending JSON
      },
      body: JSON.stringify({ model: cfg.model, messages, max_tokens: 400, temperature: 0.4 }) // why: cfg.model is the text name, because sending the whole object is what caused your error
    });
    const data = await res.json(); // why: read the reply body
    if (!res.ok) throw new Error(JSON.stringify(data)); // why: a host error counts as a failure so the backup runs
    const text = data.choices[0].message.content; // why: this is the model's answer
    if (!text) throw new Error('Empty reply'); // why: reasoning models can return nothing, so fall back to the backup
    return text; // why: hand the answer back to the route
  } finally {
    clearTimeout(timer); // why: stop the timer so it does not fire later
  }
}

app.post('/chat', async (req, res) => { // why: the one endpoint the browser talks to
  const { step, scenario, history } = req.body || {}; // why: pull out what the browser sent, safely
  if (!STEP_RULES[step] || !Array.isArray(history) || history.length === 0) { // why: reject broken requests early
    return res.status(400).json({ error: 'Missing or invalid step or history.' }); // why: tell the browser what was wrong
  }
  const clean = history // why: never trust what the browser sends
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string') // why: keep only valid chat messages
    .slice(-10); // why: only the last 10 messages, to keep requests small
  const last = clean[clean.length - 1]; // why: the most recent message
  if (!last || last.role !== 'user' || !last.content.trim()) { // why: the last message must be a non empty student message
    return res.status(400).json({ error: 'Please type something first.' }); // why: friendly message for empty input
  }
  if (UNSAFE.test(last.content)) { // why: stop a dangerous idea before the model ever sees it
    return res.json({ reply: 'That one is not safe, so we will skip it. Back to your wonder: what do you think is really causing it?' }); // why: a fixed reply behaves the same every time, unlike a model reply
  }
  const messages = [ // why: what we actually send to the model
    { role: 'system', content: `${SYSTEM}\n\nScenario: ${String(scenario || 'none').slice(0, 200)}\n${STEP_RULES[step]}` }, // why: the rules, the scenario (capped at 200 characters) and the step instruction
    ...clean // why: the conversation so far
  ];
  try { // why: catches the case where both models fail
    let reply; // why: will hold the model's answer
    try { // why: try the primary model first
      reply = await callModel(MODEL, messages); // why: the primary is the better model
    } catch (e) { // why: primary failed or timed out
      console.error('Primary failed:', e.message); // why: log the real reason so you can debug
      reply = await callModel(BACKUP_MODEL, messages); // why: use the backup so the student still gets an answer
    }
    res.json({ reply }); // why: send the answer to the browser
  } catch (e) { // why: both models failed
    console.error('Backup failed:', e.message); // why: log the real reason
    res.status(502).json({ error: 'Something went wrong. Please try again in a moment.' }); // why: a friendly error instead of a crash
  }
});

app.listen(PORT, () => console.log(`WonderLab running on http://localhost:${PORT}`)); // why: starts the server and shows which port it is using