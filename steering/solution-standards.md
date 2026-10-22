# Solution standards

Intent: the simplest correct solution that fits the real target.
Applies: when designing or writing any code or configuration.

- **Minimal:** the smallest correct solution. No boilerplate, no over-abstraction, no defensive code that is not needed yet.
- **Root cause:** fix the cause, not the symptom. If a fix only suppresses a symptom, say so and propose the real fix. A workaround is acceptable only when requested and labeled temporary.
- **Fit for the target:** verify the approach works for the actual deployment targets (providers, platforms, environments). A feature that works on only one is not a correct implementation. Test assumptions against the real constraints.
- **Use libraries:** if a well-maintained package solves it, use it; check for one before writing ~10+ lines of utility code.
- **Do not cargo-cult:** a library feature must solve the actual problem in the actual runtime; if a simpler approach works everywhere, prefer it.
- **SOLID:** single responsibility per module; open for extension, closed for modification; depend on abstractions, not implementations.
- **DRY:** one source of truth. If logic exists, extend or replace it; do not create a parallel version.
- **KISS:** a 5-line inline change beats a 50-line module.

Prevents: over-engineering, band-aids, single-target solutions, reinvented wheels.
