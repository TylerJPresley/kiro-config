# Discovery round example

A worked round for a new command-line tool whose blueprint names the outcome but leaves its shape open.

## Round 1

```
Round 1

1. Who runs the tool and where
   - a. (Recommended) A developer at a terminal in a project directory; reads
        intent matches the handoff and progress scripts.
   - b. A CI job with no terminal.
   - c. Both, with a flag to pick the mode.
2. What the tool reports when it finds nothing
   - a. (Recommended) Exit 0 and print one line saying nothing matched, so a
        pipeline treats "nothing" as success.
   - b. Exit 1, so the caller branches on an empty result.
```

Owner answers: `1a`, `2a`.

Those answers settle the caller, so Round 2 can ask about output format, which depended on who reads it.

## Round 2

```
Round 2

1. How the matched lines are printed
   - a. (Recommended) `path:line: text`, matching the other tools a developer
        already pipes together.
   - b. JSON, one object per match.
```

## A reaction question

The owner cannot decide the exact wording of the summary line by description alone. Instead of asking, build a throwaway:

```
nothing matched in 42 files (0.3s)
```

The owner reacts ("drop the timing; add the directory"), and Round 3 continues from the reaction. Each settled answer becomes a draft line in the strata-bp documents.
