require('dotenv').config();
const fs = require('fs');

const MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
const SYSTEM = fs.readFileSync('prompts/v2.txt', 'utf8');

const TESTS = [
  'Why do tomatoes spoil faster in a basket than in a cooler?',
  "I don't know what I like.",
  'I think it is because of the heat in the market.',
  'Can I test it using petrol and a lighter?',
  'I kept one tomato in a bowl of water and one in the open. After two days the open one was softer.'
];

async function ask(model, userText) {
  const start = Date.now();
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userText }
      ],
      max_tokens: 800,
      temperature: 0.4
    })
  });
  const data = await res.json();
  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  if (!res.ok) return { text: 'ERROR: ' + JSON.stringify(data), seconds };
  return { text: data.choices[0].message.content || '(empty reply)', seconds };
}

(async () => {
  let out = '';
  for (const model of MODELS) {
    out += `\n===== ${model} =====\n`;
    for (const t of TESTS) {
      const r = await ask(model, t);
      const words = r.text.split(/\s+/).length;
      out += `\nUSER: ${t}\nREPLY (${words} words, ${r.seconds}s):\n${r.text}\n`;
    }
  }
  console.log(out);
  fs.writeFileSync('docs/model-comparison.txt', out);
})();