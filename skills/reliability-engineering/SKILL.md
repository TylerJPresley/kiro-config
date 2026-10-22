---
name: reliability-engineering
description: "reliability is a measured target, not an absolute, and failures are learned from. Use when defining service levels, instrumentation, incident handling or resilience."
---

# Reliability engineering

- 100% reliability is the wrong goal: balance change with stability through error budgets; if the budget is exhausted, halt feature work and fix reliability.
- Define the on-call questions first, then the telemetry that answers them — never telemetry-first. Define quantitative SLIs (latency, error rate, saturation) with achievable SLOs; watch the four golden signals: latency, traffic, errors, saturation.
- Metrics: RED (Rate, Errors, Duration) per endpoint; USE (Utilization, Saturation, Errors) per resource.
- Instrument with OpenTelemetry; structured JSON logs carry a correlation id and an entry-point field (e.g. scheduler vs replay vs CLI); use distributed tracing; never log secrets.
- Alert on symptoms with a linked runbook, not on causes.
- Eliminate toil by automating repetitive manual work. Hold blameless post-mortems for every failure.
- Circuit breakers around every external service call; prefer push-based models (WebSockets) over polling where appropriate.

Prevents: unmeasured promises, alert noise, repeat incidents, cascading failures.
