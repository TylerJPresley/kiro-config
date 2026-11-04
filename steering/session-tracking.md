# Session tracking

Intent: the handoff carries state, so a new session resumes where the last one stopped with zero context.
Applies: at the start and end of every session and after each finished work item.

- The handoff tracks progress and state, so a new session picks up where the last one stopped with zero context.
- It holds the goal, where the work stands, the next step, decisions pending, and pointers to the plans and research.
- It is short and current, and it lives in `_internal/`, the project's working area, which stays out of the shipped product.
- A session starts by reading the handoff.
- The handoff is updated after each finished work item and before stopping.
- When a session's context grows large, the handoff is written so a fresh session takes over.
