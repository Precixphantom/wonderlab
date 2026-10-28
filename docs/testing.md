# Testing

We tested in four ways. Only the third one involves real students, and it is the most important and the smallest.

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

What we found, and what we changed because of it, is in the prompt history below.

## 3. Real students

[[FILL IN from your teammate's test log. Replace everything in this section with what actually happened. Do not write results you did not observe.]]

- Number of students: [[N]]. How they were chosen: [[for example, classmates at OAU]].
- They used the app without coaching.
- Did they begin without a specific question? [[N of N]]
- Did they state a prediction in their own words? [[N of N]]
- Was the suggested experiment something they could do? [[N of N, and what they would change]]
- Did they name something they learned or a next question? [[N of N]]
- What confused them or felt like "just a chatbot": [[their words]]
- Two short quotes, with permission and no names: [[quote 1]] [[quote 2]]

Test log: [[FILL IN: number of full conversations run, how many problems were found, the most common problem types]]. [[Link to the log if you include it in the repo, for example `docs/test-log.csv`]]

What this does and does not show: we saw [[X]]. It suggests [[Y]]. It does not prove [[Z]].

## 4. Model comparison

Described in [model.md](model.md). Raw outputs are in `docs/model-comparison.txt` and `docs/model-comparison-2.txt`.

## Prompt history

All versions are kept in `prompts/`.

| Version | Change | Why |
|---|---|---|
| v1 | First draft. | Starting point. |
| v2 | Nine numbered rules: one question per reply, under 80 words, never give the full answer, ask for a prediction before an experiment, refuse unsafe experiments. | Fix long replies and answer dumping. Models still asked two part questions. |
| v3 | Questions under 20 words, simple words, only things a student can answer from daily life. | Students found the questions too complex. |
| v4 | Every reply gives one short clue first, then one easy question. Experiments compare two things and say what result supports the prediction. | v3 produced questions with nothing to think with, and experiments that did not make sense. |
| v5 | Rewritten around noticing problems people stop seeing. Safety rules for observing from a safe place, no photographing people, no personal details, and the Reflect step ends with a nudge toward improving the problem. | Teammate's design for the final demo. Merged with v4 so the clue first rule was kept. |

Other changes made because of testing: a code level word list for dangerous requests (the models engaged with the petrol example in several runs even when told not to), a cap on the scenario text, one friendly error message instead of raw errors, and a page layout fix after a long reply was cut off in a small scrolling box.

## What we would do with more time

Run the test with at least 15 students from different courses, record whether anyone does a suggested experiment afterwards, and compare WonderLab against a plain chatbot on the same wonders.