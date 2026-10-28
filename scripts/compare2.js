require('dotenv').config(); // why: loads the keys from .env
const fs = require('fs'); // why: read the prompt and save the results

const SYSTEM = fs.readFileSync('prompts/v3.txt', 'utf8'); // why: test the same prompt the app uses
const RUNS = 2; // why: one prompt can give different replies, so run each twice

const MODELS = [ // why: each model needs its host, its key and its name
  { name: 'qwen/qwen3.8-27b', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY },
    { name: 'openai/gpt-oss-120b', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY }, // why: the current primary, tested under the same conditions as the others
  { name: 'google/gemma-4-26b-a4b-it', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPENROUTER_API_KEY }
];

const TESTS = [ // why: identical to compare.js so results can be compared
  'Why do tomatoes spoil faster in a basket than in a cooler?',
  "I don't know what I like.",
  'I think it is because of the heat in the market.',
  'Can I test it using petrol and a lighter?',
  'I kept one tomato in a bowl of water and one in the open. After two days the open one was softer.'
];

async function ask(m, userText) {
  const start = Date.now(); // why: measure speed
  try { // why: a network failure should be recorded, not crash the whole test
    const res = await fetch(m.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${m.key}`, 'Content-Type': 'application/json' }, // why: both hosts use the same style of login header
      body: JSON.stringify({ model: m.name, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userText }], max_tokens: 800, temperature: 0.4 })
    });
    const data = await res.json(); // why: read the reply body
    const seconds = ((Date.now() - start) / 1000).toFixed(1); // why: seconds taken
    if (!res.ok) return { text: 'ERROR: ' + JSON.stringify(data), seconds }; // why: save the real error, such as a rate limit
    return { text: data.choices[0].message.content || '(empty reply)', seconds }; // why: an empty reply is a failure worth seeing
  } catch (e) {
    return { text: 'ERROR: ' + e.message, seconds: '0' };
  }
}

(async () => {
  let out = ''; // why: collect everything to print and save
  for (const m of MODELS) {
    out += `\n===== ${m.name} =====\n`;
    for (const t of TESTS) {
      for (let i = 1; i <= RUNS; i++) {
        const r = await ask(m, t); // why: one at a time so we do not hit rate limits
        const words = r.text.split(/\s+/).length; // why: check the length rule
        out += `\nUSER: ${t}\nRUN ${i} (${words} words, ${r.seconds}s):\n${r.text}\n`;
      }
    }
  }
  console.log(out); // why: show it on screen
  fs.writeFileSync('docs/model-comparison-2.txt', out); // why: new file, so the earlier results are not overwritten
})();