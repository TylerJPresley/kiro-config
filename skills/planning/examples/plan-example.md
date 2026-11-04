# slugify: plan

Written for the Implementer and scripts. Run everything from the repository root. Criteria: `plan-example.criteria`.

## 1. Goal and non-goals
Goal: a `slugify(text)` function turns a title into a URL slug (lowercase, words joined by `-`, other characters dropped).
Outcome of the feature: `node --test test/slugify.test.mjs` passes and the reviewer returns PASS.
Non-goals: transliterating non-ASCII letters; configuring the separator.

## 2. Blueprint change
Follows the blueprint section "URLs" the Architect drafted and the owner approved: a slug is lowercase ASCII words joined by single hyphens, with no leading or trailing hyphen.

## 3. Pinned decisions
- D1 Separator is `-` — matches the blueprint's "joined by single hyphens".
- D2 Non-alphanumeric runs collapse to one separator — keeps slugs readable and stable.
- D3 Leading and trailing separators are trimmed — the blueprint forbids them.

## 4. Criteria
- slugify-basic :: the function joins words with a single hyphen.
- Scenario: Given the title "Hello, World!", When slugify runs, Then it returns "hello-world".
- Rule (EARS): WHEN the input has a run of non-alphanumeric characters, THE SYSTEM SHALL emit one separator for that run.
- Rule (EARS): THE SYSTEM SHALL return a slug with no leading or trailing separator.

## 5. Seams
- [ ] S1 Implement `slugify` in `src/slugify.mjs`. Files: `src/slugify.mjs`. Depends on: none.
- [ ] S2 Add `test/slugify.test.mjs` driving the three rules. Files: `test/slugify.test.mjs`. Depends on: S1.

## 6. Existing tests changed
- test/url.test.mjs :: updated to import the shared `slugify` instead of its local copy.

## 7. Risks and not verified
- Non-ASCII input is dropped rather than transliterated; the reviewer confirms this matches the blueprint.
