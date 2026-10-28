# Known limitations

We list these so you do not have to find them yourself.

## About the evidence

- **The student test was small.** We tried WonderLab with [[FILL IN: N]] students. That can reveal usability problems. It cannot show that WonderLab increases curiosity, and we do not claim it does.
- **Model comparisons were small.** Five prompts, two runs each, counted by hand. Results change between runs.
- **We have not validated the problem.** The problem statement is a hypothesis.
- **We have not done a full survey of similar products,** so we make no claim that the idea is original.

## About the model

- It can state wrong facts. The Reflect step asks the model to say what is generally known, and a model can get that wrong. Students are told to verify.
- It sometimes asks more than one question, brings in an unrelated example, or uses empty praise, even though the prompt forbids all three.
- It can invent details. In one test the Reflect step said "the number of people in line stayed the same" when the student had not written that. We added a prompt rule against this but cannot promise it never happens.
- The first replies sometimes lean on analogies instead of the student's own scenario.

## About safety

- The word list that blocks dangerous requests is short and blunt. It can block harmless uses of words like "fire" and it misses dangerous ideas that use other words.
- The prompt tells students to observe from a safe place, but the model sometimes asks a question that sounds like going near a road or drain before the Experiment step. We found this in testing and added a prompt rule, but we cannot guarantee it never happens.
- Several scenarios (roads, drains, queues) point students at public places. Students should use their own judgement and stay safe.
- The text a student types as their own wonder is placed in the system prompt (limited to 200 characters), so a student could try to steer the model. We did not test this.

## About the design

- **Game and app topics work poorly.** WonderLab is built around things a student can observe, count, time or compare. When a student typed a question about how a mobile game works, the experiments were unrealistic.
- **The lab notebook labels are by order.** The first answer is shown as "I know", the second as "I assume", the third as "I predict", whatever the student actually typed. A student who answers "I do not know" will see "I know: I do not know".
- **Three answers are always required** before the experiment. The student cannot choose to move on earlier.
- **The confidence rating** applies to whichever number was tapped last.
- **No history and no accounts.** Refreshing the page loses the session. This is deliberate for the prototype.

## About the system

- **Two hosts, both outside our control.** If both are down or rate limited, the student sees "Something went wrong. Please try again in a moment." and cannot continue. [[FILL IN: free tier limits you found]]
- **Fonts load from Google Fonts.** Offline, the page falls back to system fonts and looks plainer.
- **Tested on:** [[FILL IN: browsers and devices you actually tried, for example Chrome on Windows and Android]]. We did not test other browsers.