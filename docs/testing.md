# Testing

We tested in four ways. None of them involved real students, and we say so plainly.

## 1. Automated tests

```
npm test
```

Six tests in `tests/chat.test.js` start the real server with fake API keys and check that it serves the page, rejects unknown steps, missing history and empty input, blocks the unsafe petrol example without calling a model, and returns a friendly error when both models fail. They need no real keys and cost nothing.

## 2. Scripted conversations

`node scripts/simulate.js "<wonder>"` sends a full scripted conversation (three answers, an experiment and a reflection) through the real server and prints every reply. We used it to check each wonder against these questions:

- Does each reply give a clue before asking?
- After "I do not know", does the next question get easier and avoid repeating?
- Is the experiment something a student can do with no special tools?
- Does it say what result would support the prediction?
- Does it tell the student to observe from a safe place?
- Does the Reflect step use only what the student wrote?

The last question failed in two runs. In one scripted run the Reflect step said "the number of people in line stayed the same" when the student had only written "it happened again in the same place". In a later run using the live app, the student's "what I saw" text had no concrete result, and the AI reflection said the covered vegetables "stayed fresher for longer", which the student never wrote. We added a prompt rule against inventing details, and it did not stop this. It is listed in the limitations.

## 3. Model comparison

Described in [model.md](model.md). Raw outputs are in `docs/model-comparison.txt` and `docs/model-comparison-2.txt`.

## 4. Human feedback

One teammate (Araba Mary) used the app when the first build was ready and gave feedback, and used it again while recording the demo video. That feedback led to changes in the questions and the screens.

**We have not run sessions with other students.** So we have no data on whether students can begin without a specific question, state a prediction in their own words, do the suggested experiment, or learn something from it. This is the first thing we would do next, and the results should be reported honestly, including if the answer is no.

## Prompt history

All versions are kept in `prompts/`.

| Version | Change | Why |
|---|---|---|
| v1 | First draft. | Starting point. |
| v2 | Nine numbered rules: one question per reply, under 80 words, never give the full answer, ask for a prediction before an experiment, refuse unsafe experiments. | Fix long replies and answer dumping. Models still asked two part questions. |
| v3 | Questions under 20 words, simple words, only things a student can answer from daily life. | Feedback that the questions were too complex. |
| v4 | Every reply gives one short clue first, then one easy question. Experiments compare two things and say what result supports the prediction. | v3 produced questions with nothing to think with, and experiments that did not make sense. |
| v5 | Rewritten around noticing problems people stop seeing. Safety rules for observing from a safe place, no photographing people, no personal details, and the Reflect step ends with a nudge toward improving the problem. | The final design from Araba Mary's mock up. Merged with v4 so the clue first rule was kept. |

Other changes made because of testing: a code level word list for dangerous requests (the models engaged with the petrol example in several runs even when told not to), a cap on the scenario text, one friendly error message instead of raw errors, and a page layout fix after a long reply was cut off in a small scrolling box.

## What we would do with more time

Run the test with at least 15 students from different courses, record whether anyone does a suggested experiment afterwards, make the Reflect step ask for a concrete observation, and compare WonderLab against a plain chatbot on the same wonders.