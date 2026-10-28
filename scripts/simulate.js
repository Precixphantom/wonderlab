const HINTS = [ // why: hidden nudges so the model gives a clue, then asks about what they notice, assume, predict
  'Give me one small clue about what to look for, then ask one easy question about what I already notice or know.',
  'Give me one small clue based on my answer, then ask one easy question about what I might be assuming.',
  'Based on my answers, ask me one easy question to predict what will happen.'
];
const scenario = process.argv[2] || 'Why does water collect on this road every time it rains?'; // why: lets you test any wonder without editing the file
const answers = ['I am not sure', 'I assume it has always been like this', 'I predict it will happen again in the same place next time']; // why: generic answers that fit any wonder, unlike the old tomato ones
let history = []; // why: the server keeps no memory, so we keep it here like the page does

async function chat(step, text, hint) { // why: one call, same as callChat in the page
  history.push({ role: 'user', content: text }); // why: add the student message
  const sent = history.map((m, i) => (i === history.length - 1 && hint) ? { role: m.role, content: m.content + ' (' + hint + ')' } : m); // why: hidden hint on the last message only
  const res = await fetch('http://localhost:3000/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step, scenario, history: sent }) }); // why: the real endpoint
  const data = await res.json(); // why: read the reply
  if (!res.ok) throw new Error(JSON.stringify(data)); // why: stop on errors
  history.push({ role: 'assistant', content: data.reply }); // why: remember the reply
  return data.reply; // why: hand back the text
}

(async () => {
  console.log('AI Q1:', await chat('question', 'I am curious about this: ' + scenario + ' Please start.', HINTS[0])); // why: the first question
  console.log('\nYOU:', answers[0]); // why: show what the student said
  console.log('AI Q2:', await chat('question', answers[0], HINTS[1])); // why: second question
  console.log('\nYOU:', answers[1]);
  console.log('AI Q3:', await chat('question', answers[1], HINTS[2])); // why: the prediction question
  console.log('\nYOU:', answers[2]);
  console.log('AI EXPERIMENT:', await chat('experiment', answers[2])); // why: the experiment
  const seen = 'I watched from a safe place for ten minutes. It happened again in the same place.'; // why: a generic observation that fits any wonder
  console.log('\nYOU:', seen);
  console.log('AI REFLECT:', await chat('reflect', seen)); // why: the reflection
})();