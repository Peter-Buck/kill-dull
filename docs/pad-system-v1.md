# PITCH AGAINST DULL — SYSTEM V1

Status: BUILD SPEC

## Product

Pitch Against Dull is one online subscription product with five complete, standalone experiences:

- BRIEF
- PLAY
- DESIGN
- PITCH
- LEARN

Each works independently. Connections between tools are optional handoffs, never dependencies.

## Commercial model

- FREE — $0 — 3 complete sessions/month across all tools
- PRO — $59/month — 1 user, all tools, high usage, history, PLAY hosting
- TEAM — $249/month — up to 5 users, shared workspace
- STUDIO — $499/month — up to 15 users, shared workspace
- ENTERPRISE — contact

Payment provider is intentionally NOT selected in v1. Billing must be implemented behind an adapter so Stripe, Paddle, Lemon Squeezy, or another provider can be added without changing product logic.

## Core account model

One user account.
One active plan.
One default workspace.
Optional shared workspace for Team/Studio.
All five tools share the same identity, entitlements, usage, history, and storage layer.

## Routes

Public:
- /
- /brief
- /play
- /design
- /pitch
- /learn
- /pricing
- /about
- /privacy
- /terms

Account:
- /login
- /signup
- /account
- /account/history
- /account/billing
- /workspace
- /workspace/members

## Shared system layers

### Identity
- user
- account/session
- workspace
- workspace membership

### Plans and entitlements
Plans are internal product objects, not hard-wired to a payment provider.

Entitlements include:
- monthly session allowance
- tool access
- saved history
- PLAY host permission
- workspace seat limit
- shared workspace permission
- enterprise flags

### Usage
Every completed tool session creates one usage event.
FREE receives 3 completed sessions/month across BRIEF, PLAY, DESIGN, PITCH, LEARN.
Paid plans use configurable limits; avoid exposing credits/tokens in the UI.

### Sessions
Common session shell:
- id
- user_id
- workspace_id
- tool: brief | play | design | pitch | learn
- status: draft | active | complete | archived
- created_at
- updated_at
- completed_at
- title
- input
- output
- metadata

### Storage
Private by default.
Uploaded briefs, creative work, PDFs, images, video, and session outputs belong to the user/workspace.
Do not use private work to train public models.

## Billing adapter

Billing provider interface must support:
- create checkout
- create/manage customer
- subscription status
- plan mapping
- upgrade
- downgrade
- cancel
- billing portal
- webhook verification
- invoice/payment status

Product code may only depend on the internal billing interface, never Stripe/Paddle-specific objects.

Internal subscription states:
- free
- trialing
- active
- past_due
- canceled
- enterprise

## BRIEF

Standalone input: brand/category/problem/challenge.

Flow:
1. Setup
2. Five truth questions
3. AI classification: TRUE / ALMOST / MARKETING TRUTH
4. Challenge/retry weak answers
5. Category autopsy
6. Flip the script
7. Provocation
8. Save/export

Core five questions:
1. The truth and nothing but the truth. What makes this brand genuinely interesting or genuinely broken?
2. What do real people actually say about this category when nobody's listening?
3. What does this brand do that no competitor could honestly claim?
4. What are people caught between?
5. If this brand disappeared tomorrow — what would the world actually lose?

Do not generate fake consumer evidence. Any consumer/research evidence must be explicitly user-provided or sourced through a verified research integration later.

Optional handoff: Open output in PLAY.

## PLAY

Standalone multiplayer creative game. Existing experience name: THE STORM.

Entry:
- Host
- Join

Host can paste any brief/challenge or optionally import a BRIEF output.

ROUND 1 — RANDOM WORDS
- 3 random words/player
- create idea against challenge
- name idea
- randomized pitch order
- 90-second pitch
- vote
- no self-voting

ROUND 2 — STEAL AND REINTERPRET
- private world-class campaign card
- identify mechanic
- apply mechanic to challenge
- required pitch opening: “I STOLE FROM ___ BECAUSE…”
- pitch
- vote

FINAL — THE RECKONING
- all ideas return
- KILL IT / KEEP IT / DEVELOP IT
- no self-voting
- survivors screen

Optional handoff: Open survivor in PITCH.

## DESIGN

Standalone design interrogation with three documented schools of thought.
AI must never pretend to be the designer.

### RAMS — MAKE IT BETTER
Product design.
Based on Dieter Rams' documented design principles.

### MAU — MAKE IT DIFFERENT
Creative process.
Based on Bruce Mau's documented Incomplete Manifesto for Growth and related published thinking.

### NORMAN — MAKE IT WORK
Experience design.
Based on Don Norman's documented human-centered design principles.

Input:
- work/upload/description
- what is it?
- who is it for?
- what problem does it solve?

Result language:
- HOLDS
- TENSION
- BREAKS

Optional handoff: Open work in PITCH.

## PITCH

Standalone flagship creative interrogation.

Entry asks stage:
- ROUGH IDEA
- READY TO PRESENT
- FINAL / PUBLIC

Input:
- image
- PDF
- video
- text
- what are you trying to prove?

Interrogates against current THE 10.
Do not use the old 12-principle set.
Exact current THE 10 must be verified before hard-coding.

Output:
- strongest argument
- weakest argument
- what the work proves
- what it does not prove
- the question you will get asked
- what would make the case stronger

Final human verdict:
- DUH
- HMM
- DULL

Principle: AI interrogates. Judgment stays human.

## LEARN

Standalone judgment practice, not courses.

Modes:
- THE 10 — principle → example → user call → reveal
- GREAT WORK — work first → user explains what works → mechanic revealed
- COLLISIONS — two principles conflict → user chooses what matters in context

Track progress/history but avoid gamification that cheapens the product.

## Shared interaction model

Every tool follows:
INPUT → PRESSURE → CHOICE → OUTPUT

Never:
INPUT → AI ANSWER

The human must always make a visible judgment or choice.

## Information architecture

Primary nav:
BRIEF · PLAY · DESIGN · PITCH · LEARN · PRICING

Secondary:
ABOUT · LOGIN / ACCOUNT

THE 10 are the intellectual foundation underneath the five tools, not a sixth equal product door.

## Homepage

Hero:
PITCH AGAINST DULL■
YOU HAVE THE IDEA. NOW MAKE THE CASE.

Five doors:
- BRIEF — Find the problem worth solving.
- PLAY — Stop brainstorming. Start playing.
- DESIGN — Put design under pressure.
- PITCH — Make the argument survive.
- LEARN — Train your judgment.

Institutional line:
BY KILL DULL™

## Pricing page

FREE — $0
PRO — $59/month
TEAM — $249/month
STUDIO — $499/month
ENTERPRISE — TALK TO US

Pricing logic lives in internal plan configuration and is provider-agnostic.

## Privacy principle

Private by default.
Unreleased creative work and confidential briefs are treated as private workspace content.
No public publishing by default.
No public model training from private content.

## Build rule

Do not retrofit this architecture directly into the old root HTML pages.
Preserve truth.html, storm.html, and reckoning.html as source material until the relevant mechanics have been ported and verified.

Build the new PAD application as a clean application layer, then migrate mechanics deliberately.
