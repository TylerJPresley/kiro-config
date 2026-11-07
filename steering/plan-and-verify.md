# Plan and verify

Intent: every task stays on one loop so work is planned, checked against the plan, and stopped on evidence.
Applies: on every task, sized to the task.

- Small work is just done, then checked by the one check that covers it. Work is small when it leaves behavior, specs, interfaces, permissions, security settings and data as they are, touches one or two files, and has nothing depending on it. Rewording a document (steering, agent prompts, skills, README or other docs) is also small, whatever the number of files, when every rule in it stays as it was; the check is the lint that covers it (`steering-lint` for steering and skills). Adding, removing or loosening a rule, a permission or a limit is planned work, whatever its size.
- Anything larger is planned first, then verified against the plan by a script or by a check from someone other than the one who did the work. The plan names its verification: script checks always, and an independent check when the feature touches behavior, a public interface, permissions, security or data.
- A trigger mid-work moves small work up to planned work, and never down on a guess.
- When a feature that changes behavior a user sees closes, and at every release, the verification step checks what changed in a real environment: a scratch setup that leaves the owner's own configuration alone, with real-model turns capped. The `real-environment-verification` skill holds the method.
- If verification fails, fix the weakest point and re-verify only that. If the same approach fails twice, change approach and say so.
