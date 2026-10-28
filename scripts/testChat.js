(async () => {
  const res = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      step: 'question',
      scenario: 'Tomatoes spoil faster in a basket than in a cooler',
      history: [{ role: 'user', content: 'I think it is the heat' }]
    })
  });
  console.log(res.status, await res.text());
})();