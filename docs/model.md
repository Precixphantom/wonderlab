# Model choice and licences

## What we chose

| | Model | Host | Role |
|---|---|---|---|
| Primary | Gemma 4 26B A4B instruct, `google/gemma-4-26b-a4b-it` | OpenRouter | Answers all model calls. |
| Backup | gpt-oss 120B, `openai/gpt-oss-120b` | Groq | Used only if the primary fails or takes longer than 20 seconds. |

Both are open weight models, used through hosted APIs. We did not self host because the team has no GPU and the deadline was short. Araba Mary brought the first shortlist of open weight models, and Precious ran the comparisons below.

## What the model does in WonderLab

The model is the part that a fixed form could not do. It reads the student's last answer and writes the next question and a small clue. It proposes an experiment that checks the student's own prediction. It looks back at the prediction after the student reports what they saw. The start screen, the scenarios and the notebook are fixed and do not use the model.

## Why these models

We ran the same prompts through several models and compared the replies by hand. The tests were small, so this is a judgement from a few examples, not a benchmark.

Test set: five student messages (a plain question, "I don't know what I like", a guess at a cause, an unsafe request involving petrol and a lighter, and an observation). Each was sent twice. We looked for: one question only, replies under the length limit, staying on the student's topic, not giving away the answer, and refusing the unsafe request without discussing it.

| Model | What we saw (counted by hand, 10 replies each) |
|---|---|
| Gemma 4 26B A4B | Stayed on topic in all 10. Did not engage with the unsafe request. Did not give answers away. Used empty praise once. |
| gpt-oss 120B | Stayed on topic in all 10. Engaged with the unsafe idea in one of two unsafe replies ("what did you expect to happen when you used the petrol"). |
| Qwen 3.8 27B | Went off topic or invented context in about 5 of 10 replies (a "first glass", an "original soup"). Used validating phrases such as "that makes sense" and "good guess". Once suggested heating a spoon over a candle in reply to the petrol request. |
| gpt-oss 20B | One reply invited the student to imagine lighting petrol. Vaguer questions overall. Not chosen. |

The same prompt can give different replies on different runs, so these counts are rough. Gemma was the most consistent in our runs, so it became the primary. gpt-oss 120B is the backup because it is on a different host, which means one host failing does not take both models down.

The raw outputs are in `docs/model-comparison.txt` and `docs/model-comparison-2.txt`. You can repeat the comparison with `node scripts/compare2.js` (you need both keys). `node scripts/simulate.js "<wonder>"` runs a full scripted conversation through the real server.

## Licences

| Model | Licence | Where to check |
|---|---|---|
| Gemma 4 | Apache 2.0 | Reported at release by [The Register](https://www.theregister.com/2026/04/02/googles_gemma_4_open_weights/) and [AlternativeTo](https://alternativeto.net/news/2026/4/google-releases-gemma-4-open-weight-ai-models-with-apache-2-0-license). Model page: https://huggingface.co/google/gemma-4-26B-A4B-it |
| gpt-oss 120B | Apache 2.0 | Model page: https://huggingface.co/openai/gpt-oss-120b |

Open weights do not automatically mean open source, so we checked the licence of each model we use. We have not reviewed the hosts' terms of service in detail beyond using their public APIs under the standard terms, and anyone reusing this should read them.

Qwen 3.8 27B was tested but is not used, so we did not need to confirm its licence.

## Hosted API question

The challenge brief does not say whether using an open weight model through a hosted API counts. We read the brief as allowing existing APIs as resources. We did not get a confirmed answer from the organisers, so this is our reading.

## Limitations of the models

- They can state wrong facts with confidence. The page shows a reminder, and the prompt asks the model to remind students to check claims.
- They can invent a result the student never reported, especially when the student gives no concrete observation. See [limitations.md](limitations.md).
- They sometimes ask two questions, drift to an unrelated example, or offer empty praise, even with the prompt rules. The rules reduce this but do not remove it.
- The app depends on two hosted services. If both are down, the student sees a friendly error and cannot continue. We did not measure the hosts' free tier limits.
- Reply quality changes between runs because the models are not deterministic.