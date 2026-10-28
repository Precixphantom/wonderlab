require('dotenv').config();
(async () => {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
  });
  const data = await res.json();
  if (!res.ok) { console.log('Error:', res.status, data); return; }
  data.data.forEach(m => console.log(m.id));
})();