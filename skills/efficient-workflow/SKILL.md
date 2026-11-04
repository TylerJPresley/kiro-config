---
name: efficient-workflow
description: "keep the number of requests low, because each request resends the whole context. Use whenever a step needs several reads, greps, git checks or scripts, or whenever a result must be waited for."
---

# Efficient workflow

Intent: reach the result in as few requests as possible, because every model request resends the whole context and each request is the cost.

## When to use
- A step needs more than one read, grep, glob, git check or script.
- A long-running job's result must be waited for.
- Output is large and only a summary is needed.

## How to work
1. Before every tool call, list every other read, grep, git check or script the step already needs, and send them in the same block. Make a separate call only when its input depends on a previous result.
2. Put every independent tool call in one block, and read several files in one call with several operations.
3. Fold related shell steps into one command with labelled sections and trimmed output, such as `| tail -20` or `| head -40`.
4. Wait with one blocking command rather than polling, such as `timeout 600 bash -c 'until grep -q DONE LOG; do sleep 5; done'`, which returns once the result is ready.
5. Read a file once, by the range the task names; read a script's summary first and open the full log only for a failure.
