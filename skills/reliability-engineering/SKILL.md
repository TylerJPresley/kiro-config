---
name: reliability-engineering
description: "Reliability is a measured target, and failures are learned from. Use when defining service levels, instrumentation, incident handling or resilience."
---

# Reliability engineering

Intent: reliability is a measured target balanced against change, so a service stays within its budget and every failure teaches the next design.

## When to use
- Defining service levels, telemetry, incident handling or resilience for a service.

## How to work
1. Treat reliability as a budget: balance change with stability through an error budget, and when the budget is spent, hold feature work and restore reliability.
2. Define the on-call questions first, then the telemetry that answers them. Set quantitative SLIs (latency, error rate, saturation) with achievable SLOs, and watch the four golden signals: latency, traffic, errors, saturation.
3. Track RED (Rate, Errors, Duration) per endpoint and USE (Utilization, Saturation, Errors) per resource.
4. Instrument with OpenTelemetry; keep structured JSON logs carrying a correlation id and an entry-point field (scheduler, replay, CLI); use distributed tracing; keep secrets out of logs.
5. Alert on symptoms with a linked runbook.
6. Automate repetitive manual work to remove toil, and hold a blameless post-mortem after every failure.
7. Wrap every external service call in a circuit breaker, and prefer a push model (WebSockets) over polling where it fits.
