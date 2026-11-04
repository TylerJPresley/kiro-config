# Feedback loops for diagnosis

A feedback loop is the command that turns a change into an answer: run it, read the result, decide the next step. A tight loop makes diagnosis fast and keeps each run honest.

## Build the loop before forming a hypothesis
- Find or write one command that reproduces the failure and nothing else. A single failing test or a scripted call beats a full suite run.
- Make it fast. A loop measured in seconds lets each hypothesis be tested at once; a loop measured in minutes pushes toward guessing.
- Make it deterministic. Pin the inputs, the seed, the clock and the environment so the same run gives the same result. A flaky loop proves nothing.
- Capture the signal that distinguishes success from failure: the exit code, the asserted value, the logged line. The loop answers one question each run.

## Work the loop
1. Run the loop and read the real output. Record what happened, not what should have happened.
2. Change one thing: an input, a code line, or an instrumented log point.
3. Run the loop again. The difference between the two runs is the evidence.
4. Keep going until the actual state and the expected state first diverge at a single, named point.

## Instrument at the divergence
- Add a log or an assertion at the point where the two states are expected to still agree. The run that shows them disagreeing locates the cause.
- Remove the instrumentation once the cause is named, or fold it into the regression test if it still earns its place.

## Close the loop
- The regression test becomes a permanent loop: it fails on the old code and passes on the fixed code, so the same bug cannot return unnoticed.
- Keep the reproduction command in the commit message or the plan so the next reader runs the same loop.
