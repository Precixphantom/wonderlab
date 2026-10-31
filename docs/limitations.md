# Known limitations

We list these so you do not have to find them yourself.

## About the evidence

- **We have not tested with real students.** The only human feedback so far is from one teammate who used the first build. We cannot say whether WonderLab helps students, and we do not claim it does.
- **Model comparisons were small.** Five prompts, two runs each, counted by hand. Results change between runs.
- **We have not validated the problem.** The problem statement is a hypothesis.
- **We have not done a full survey of similar products,** so we make no claim that the idea is original.

## About the model

- **It can invent a result.** In a test run on the live app, the student's "what I saw" text contained no concrete observation. The AI reflection then said "you noticed that the covered vegetables stayed fresher for longer, which matched your prediction". The student never wrote that. An earlier scripted run did the same with a queue. We added prompt rules against it, and they reduce it but do not remove it. A better fix is to make the Reflect step ask what the student actually saw when the answer is vague. We have not built that yet.
- It can state wrong facts. The Reflect step asks the model to comment on what the student noticed, and a model can get that wrong. Students are told to verify.
- It sometimes asks more than one question, brings in an unrelated example, or uses empty praise, even though the prompt forbids all three.
- Replies can be unclear. The first replies sometimes lean on analogies instead of the student's own scenario.

## About safety

- The word list that blocks dangerous requests is short and blunt. It can block harmless uses of words like "fire" and it misses dangerous ideas that use other words.
- The prompt tells students to observe from a safe place, but the model sometimes asks a question that sounds like going near a road or drain before the Experiment step. We found this in testing and added a prompt rule, but we cannot guarantee it never happens.
- Several scenarios (roads, drains, queues) point students at public places. Students should use their own judgement and stay safe.
- The text a student types as their own wonder is placed in the system prompt (limited to 200 characters), so a student could try to steer the model. We did not test this.

## About the design

- **The lab notebook is hard to read on its own.** It shows the student's answers but not the questions they were answering. The labels also go by order: the first answer is shown as "I know", the second as "I assume", the third as "I predict", whatever the student actually typed. A student who answers "I do not know" first will see "I know: I do not know".
- **Game and app topics work poorly.** WonderLab is built around things a student can observe, count, time or compare. When we typed a question about how a mobile game works, the experiments were unrealistic.
- **Three answers are always required** before the experiment. The student cannot choose to move on earlier.
- **The confidence rating** applies to whichever number was tapped last.
- **No history and no accounts.** Refreshing the page loses the session. This is deliberate for the prototype.

## About the system

- **Two hosts, both outside our control.** If both are down or rate limited, the student sees "Something went wrong. Please try again in a moment." and cannot continue. We did not measure the free tier limits of either host.
- **The free hosting sleeps.** After about 15 minutes without visitors the live demo takes around a minute to wake up.
- **Fonts load from Google Fonts.** Offline, the page falls back to system fonts and looks plainer.