// Basic tests for the WonderLab server. Run them with: npm test
// They start the real server on a spare port with FAKE API keys, so they cost nothing and need no real keys.
const { test, before, after } = require('node:test'); // why: Node's built in test runner, so no extra install is needed
const assert = require('node:assert'); // why: built in checks
const { spawn } = require('node:child_process'); // why: lets the test start the server as a separate process
const path = require('node:path'); // why: builds a safe path to the project folder on any operating system

const PORT = 3101; // why: a different port from the normal 3000, so the tests never clash with a running app
let server; // why: holds the server process so we can stop it at the end

before(async () => { // why: runs once before all tests
  server = spawn(process.execPath, ['server.js'], { // why: start the real server code
    cwd: path.join(__dirname, '..'), // why: server.js reads files relative to the project folder
    env: { ...process.env, PORT: String(PORT), OPENROUTER_API_KEY: 'fake', GROQ_API_KEY: 'fake' } // why: fake keys mean both models fail on purpose, which lets us test failure handling
  });
  await new Promise((resolve, reject) => { // why: wait until the server says it is ready
    server.stdout.on('data', d => { if (String(d).includes('running')) resolve(); }); // why: the server prints this line when it starts
    server.on('error', reject); // why: fail clearly if the process cannot start
    setTimeout(() => reject(new Error('Server did not start in 8 seconds')), 8000); // why: never hang forever
  });
});

after(() => { server.kill(); }); // why: always stop the server so the terminal is not left hanging

async function post(body) { // why: one helper for sending a chat request
  const res = await fetch(`http://localhost:${PORT}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: res.status, data: await res.json() }; // why: tests check both the status code and the body
}

test('serves the front end page', async () => {
  const res = await fetch(`http://localhost:${PORT}/`);
  const html = await res.text();
  assert.strictEqual(res.status, 200); // why: the page must load
  assert.ok(html.includes('WonderLab')); // why: confirms it is our page and not an error page
});

test('rejects an unknown step', async () => {
  const r = await post({ step: 'nonsense', scenario: 'x', history: [{ role: 'user', content: 'hi' }] });
  assert.strictEqual(r.status, 400); // why: the server must not guess what to do with a bad step
});

test('rejects missing history', async () => {
  const r = await post({ step: 'question', scenario: 'x' });
  assert.strictEqual(r.status, 400); // why: no conversation means nothing to answer
});

test('handles empty input', async () => {
  const r = await post({ step: 'question', scenario: 'x', history: [{ role: 'user', content: '   ' }] });
  assert.strictEqual(r.status, 400); // why: empty or blank messages are refused
  assert.ok(r.data.error); // why: the browser needs a message to show
});

test('blocks an unsafe idea without calling any model', async () => {
  const r = await post({ step: 'question', scenario: 'x', history: [{ role: 'user', content: 'Can I test it using petrol and a lighter?' }] });
  assert.strictEqual(r.status, 200); // why: the safe reply is a normal answer, not an error
  assert.ok(r.data.reply.includes('not safe')); // why: this is the fixed safety reply, and it works even with fake keys
});

test('handles API failure with a friendly message', async () => {
  const r = await post({ step: 'question', scenario: 'Why does a room get hot?', history: [{ role: 'user', content: 'I am curious about this. Please start.' }] });
  assert.strictEqual(r.status, 502); // why: both models fail because the keys are fake
  assert.strictEqual(r.data.error, 'Something went wrong. Please try again in a moment.'); // why: students must never see a raw error
});