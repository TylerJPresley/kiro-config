# Discovery round template

A round puts every open question in one block so the owner answers them together. Each question is flat (never nested inside another), carries a recommended answer, and settles something a later question depends on.

## Shape of a round

```
Round <n>

1. <question, one line: the blank and why it is open>
   - a. (Recommended) <recommended answer, short reason>
   - b. <alternative>
   - c. <alternative>
2. <next question>
   - a. (Recommended) <recommended answer>
   - b. <alternative>
```

Rules:
- Only questions whose prerequisites are settled belong in a round. Hold a question whose answer depends on an open one for a later round.
- Facts the agent can look up are resolved before the round, not asked.
- Each question has one idea. Split a two-part question into two.
- The recommended answer is option a, prefixed `(Recommended)`.
- A question answerable only by reaction gets a throwaway to react to, and its answer opens the next round.

## Closing

Discovery ends when a round opens no new questions and the owner confirms the shared understanding. Each answer is written into the strata-bp documents as a draft for the owner to approve.
