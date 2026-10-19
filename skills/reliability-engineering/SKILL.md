---
name: reliability-engineering
description: "reliability is a measured target, not an absolute, and failures are learned from. Use when defining service levels, instrumentation, incident handling or resilience."
---

# Reliability engineering

- 100% reliability is the wrong goal: balance change with stability through error budgets; if the budget is exhausted, halt feature work and fix reliability.
- Define quantitative SLIs (latency, error rate, saturation) with achievable SLOs. Watch the four golden signals: latency, traffic, errors, saturation.
- Instrument with OpenTelemetry; use structured JSON logs and distributed tracing.
- Eliminate toil by automating repetitive manual work. Hold blameless post-mortems for every failure.
- Circuit breakers around every external service call; prefer push-based models (WebSockets) over polling where appropriate.

Prevents: unmeasured promises, alert noise, repeat incidents, cascading failures.
