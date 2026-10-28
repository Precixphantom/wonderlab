# WonderLab

**Wonder first. Answers later.**

WonderLab is a guided AI experience that helps a university student practise noticing and questioning the everyday problems they have stopped seeing. The student picks a place to look (agriculture, everyday engineering, or "help me discover") and gets a local scenario. The AI then asks questions instead of giving answers. The student separates what they know from what they assume, makes a prediction, tries one small and safe observation, writes down what they saw, and leaves with a next question and a short lab notebook.

Built for OPEN//BUILD 2026 by Open Source Community Africa, Ile Ife (part of Hacktoberfest 2026).

## The problem

Some university students may struggle to turn everyday observations or personal interests into questions they want to investigate, experiments they can try, or ideas they can develop. They need an engaging, guided way to practise asking questions, exploring possibilities and testing their thinking, not just receiving ready made answers.

We want to be clear about what we know. This is a starting hypothesis. We did not assume that Nigerians or Nigerian students lack curiosity, and people across Nigeria already solve problems every day. Any testing with students is small, and it can show usability problems but cannot show that WonderLab increases curiosity. What we have tested and what we saw is written down in [docs/testing.md](docs/testing.md).

## Who it is for

University students who are curious but do not always know what to explore or how to begin. We started with two areas, agriculture and everyday engineering, and kept the scenarios local: markets, roads, farms, rooms and queues.

## How it works

| Screen | What happens | What the model does |
| --- | --- | --- |
| 1. Start | The student chooses Agriculture, Everyday engineering or Help me discover, or types their own wonder. | Nothing. |
| 2. Wonder | One local scenario is shown, with a shuffle button. | Nothing. The scenarios are written in the page. |
| 3. Question | Three short follow ups, one at a time: what do you know, what do you assume, what do you predict. | Gives a small clue and asks the next question from the student's last answer. |
| 4. Experiment | One safe observation test that checks the student's own prediction. A "Make it simpler" button asks for an easier one. | Proposes and adapts the experiment. |
| 5. Reflect | The student types what they saw. The app comments on it, asks one next question, and shows a lab notebook. | Reflects and asks how the problem could be improved. |

## How it differs from a plain chatbot (design hypotheses)

These are things we designed for, not things we have proven.

- A student who arrives with no question gets a concrete starting scenario.
- The AI asks one question at a time and does not take over with a long answer.
- Predictions come before experiments, and observations are written down and reflected on.
- Scenarios and experiments are local and cheap, and they only involve observing, counting, timing or comparing.

We have not done a full survey of similar learning and curiosity products, so we do not claim that this approach is unique.

## The model

| | Model | Host | Licence |
| --- | --- | --- | --- |
| Primary | Gemma 4 26B A4B instruct (`google/gemma-4-26b-a4b-it`) | OpenRouter | Apache 2.0 |
| Backup | gpt-oss 120B (`openai/gpt-oss-120b`) | Groq | Apache 2.0 |

Both are open weight models. We use them through hosted APIs and do not run them ourselves. The model writes the follow up questions, proposes the experiment and reflects on the observation. Everything else is fixed. Licence sources, why we chose these models, what we compared and what the limits are is written in [docs/model.md](docs/model.md).

The brief does not say whether using an open weight model through a hosted API counts. We read it as allowed because the brief permits existing APIs as resources, but that is our reading and not a confirmed answer. Using the hosts is also subject to their own terms of use.

## Quick start

You need Node.js 18 or newer and at least one working API key: an OpenRouter key for the primary model and a Groq key for the backup. If one host fails, the app tries the other.

Download or clone this repository, open a terminal in its folder, and install the dependencies.

```
npm install
```

Copy the example settings file and add your keys.

```
copy .env.example .env
```

On macOS or Linux use `cp .env.example .env`. Open `.env` and fill in `OPENROUTER_API_KEY` and `GROQ_API_KEY`. Never commit this file. It is already listed in `.gitignore`.

Start the app and open it in a browser.

```
npm start
```

Then go to <http://localhost:3000>.

Run the tests. They use fake keys, so they need no real keys and cost nothing.

```
npm test
```

## Architecture

```
Browser (public/index.html)
   |  POST /chat  { step, scenario, history }
   v
Express server (server.js)
   - checks the request, keeps the last 10 messages
   - blocks a short list of dangerous words before any model is called
   - adds the system prompt (prompts/v5.txt), the scenario and a step instruction
   - calls the primary model, falls back to the backup model on error or timeout
   v
Hosted open weight model  ->  reply  ->  browser
```

Key decisions:

- **The server controls the step.** The browser says which step it is on (question, experiment or reflect). The server adds a matching instruction. This keeps the model from jumping to a long answer.
- **The server remembers nothing.** The browser holds the conversation and sends it each time. There are no accounts and nothing is saved.
- **Two models on two hosts.** A slow or failed primary does not stop the demo.
- **Prompts are plain text files** in `prompts/`. We kept every version so the changes can be read.

## Safety

The system prompt refuses experiments involving electricity, fire, chemicals, medicine, heights, traffic, deep water or animals in distress. It tells students to observe from a safe place away from roads and crowds, not to photograph or approach people without permission, and not to share personal details. The server also blocks a short list of dangerous words before the model sees them. That list is blunt: it can block harmless uses and it will miss other dangerous ideas. The page shows a reminder that AI can be wrong. See [docs/limitations.md](docs/limitations.md).

## Testing

We test in four ways: automated tests (`npm test`), scripted full conversations through the real server, model comparisons, and short sessions with students. The method, the results and the history of our prompt changes are in [docs/testing.md](docs/testing.md). We report small tests as small tests.

## Known limitations

Short version: testing was small, the model can give wrong or off topic replies, the safety word list is blunt, and game or app topics produce weak experiments. The full list is in [docs/limitations.md](docs/limitations.md).

## Acknowledgements and AI assisted work

- **Models:** Gemma 4 by Google DeepMind and gpt-oss by OpenAI, both released as open weight models under Apache 2.0. Qwen 3.8 27B and gpt-oss 20B were also tested while choosing a model and are not used.
- **Hosts:** OpenRouter and Groq.
- **Libraries:** Express (MIT) and dotenv (BSD 2 Clause).
- **Fonts:** Fraunces, Instrument Sans and IBM Plex Mono, loaded from Google Fonts. Each is released under the SIL Open Font License.
- **Our own work:** The concept, the problem statement and the testing plan were written by the team. The wording of the start and wonder screens, the ten scenarios, the lab notebook labels and the safety and privacy rules came from Araba Mary's design.
- **AI assisted work, disclosed in detail:** We used Claude (by Anthropic) as a coding and writing assistant. Claude helped write `server.js`, `public/index.html` (the design and the code), drafts of the system prompts in `prompts/`, the helper scripts in `scripts/`, the tests in `tests/`, and the first drafts of these documents. We reviewed, tested and edited this work, ran the model comparisons described in `docs/model.md`, and made the final choices about models, scenarios and safety rules.

## Future work and how to contribute

- Test with more students and report the results, including when WonderLab does not help.
- Let the notebook record which answer was a fact, an assumption or a prediction, instead of showing them in order.
- Add more interest areas and local languages.
- Support topics about software and games with experiments that fit them.
- Replace the word list safety check with something better.

Contributions are welcome. Open an issue or a pull request. By contributing you agree your work is released under the MIT licence.

## Team

- **Precious**, Computer Science Student, Obafemi Awolowo University. Backend, model integration, front end and repository.
- **Araba Mary.**, Computer Science Student, Obafemi Awolowo University. Prompts and scenarios, student testing, test log, problem statement and demo story.

## Licence

MIT. See [LICENSE](LICENSE).
