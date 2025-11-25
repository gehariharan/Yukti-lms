# Yukti Learning Platform – Prototype Spec (v2.0)

This document supersedes the archived MVP specs. It describes the short‑term prototype we want to build right now: a leadership learning experience that uses globally understandable terminology and highlights one fully scripted learning track, **“Me in My Team.”**

---

## 1. Product Vision

Yukti helps participants turn leadership theory into practice. Each participant selects a **Learning Track** (e.g., “Me in My Team”) and works through a sequence of **Challenges**. Every challenge is a guided experience that mixes:

- Structured inputs (questionnaires, sliders, multi-select, free text)
- Interpretations of the participant’s responses mapped to proven frameworks
- Concept visuals/videos displayed alongside the dialogue
- An AI coach who personalizes the conversation with the participant’s role, industry, and recent answers
- Action items that unlock the next challenge

The prototype should demonstrate this full loop for one track while making space in the UI to preview other tracks.

---

## 2. Key Terminology (global naming)

| Term | Description |
| --- | --- |
| **Track** | A curated sequence of challenges themed around a leadership capability (e.g., “Me in My Team”) |
| **Challenge** | A gated learning module inside a track; includes assessments, AI dialogue, and assets |
| **Participant** | The learner; the onboarding flow captures their name, role, team size, and industry |
| **AI Coach** | The conversational agent (Gemini/GPT) that probes, interprets scores, and narrates |
| **Action Plan** | The set of commitments or reflections at the end of a challenge |
| **Concept Panel** | The right-side panel that showcases framework images, slides, or short clips |

---

## 3. Track Catalog (MVP view)

For demo purposes the home screen shows four track cards:

1. **Me in My Team** – active track with full prototype
2. **Leading Through Change** – placeholder card (locked)
3. **Decision Velocity** – placeholder card (locked)
4. **Coaching Conversations** – placeholder card (locked)

Only the first track is interactive right now; the rest hint at future scope.

---

## 4. Track Detail – “Me in My Team”

This track contains three sequential challenges. Participants must complete each challenge to unlock the next.

### 4.1 Challenge 1 – Self vs. Others Reflection Tool

**Goal:** Help the participant understand whether they lead primarily from self-focus or team-focus.

**Flow**

1. Present a questionnaire (Likert scale). Static config contains:
   - Question text
   - Scale labels (e.g., 1–5)
   - Scoring weights
2. On submission, compute total and map to one of four segments (e.g., “Self-Driven,” “Team-Aligned,” etc.) using the interpretation table supplied by content.
3. Display interpretation:
   - AI Coach summarises what the score means in the participant’s industry/role.
   - Concept panel shows the “Self vs. Others in Leadership” framework image.
   - Highlight where the participant falls on the framework (textual indicator for now).
4. Unlock Challenge 2 with a CTA (“Continue to Values Recognition”).

### 4.2 Challenge 2 – Values Recognition

**Goal:** Teach the participant to observe values signals inside their team.

**Flow**

1. Participant enters two teammates (Person A & Person B).
2. Each teammate is assessed against a fixed set of prompts/questions (static config).
3. For every teammate, compute which **Values Recognition quadrant** they fall into.
4. Outputs:
   - AI Coach reflects back the patterns (“Person A leans toward ‘Stability & Order’ because…”).
   - Concept panel displays the Values Recognition framework image.
   - Action plan section encourages notes per teammate.
5. Unlock Challenge 3.

### 4.3 Challenge 3 – Values Response Framework + Case Study

**Goal:** Practice responding to different value archetypes with supportive + challenging behaviors.

**Flow**

1. Participant reuses Person A & B (or edits them).
2. Guided questions collect how the participant currently supports/challenges each teammate.
3. Introduce **Values Response Framework** (image). AI Coach explains the four response strategies and maps each teammate to the recommended quadrant.
4. **Case study practice:**
   - Content contains one base case study + canonical mapping to the four response frameworks + sample answers.
   - AI Coach rewrites the case study intro to match the participant’s industry/role (simple prompt templating).
   - Participant answers how they would apply each response strategy.
   - AI Coach compares answers to the canonical guide and provides feedback.
5. Conclude with an action plan summarizing:
   - Key insight per teammate
   - Next support/challenge experiment
   - A reminder to revisit after one week (placeholder for future reminders).

---

## 5. Content + Asset Management

All challenge inputs live as static JSON/Markdown under `product/content/me-in-my-team/` for now.

| File | Purpose |
| --- | --- |
| `challenge1_self_vs_others.json` | Questions, scoring weights, interpretation bands |
| `challenge2_values_recognition.json` | Prompts for Person A/B, quadrant rules |
| `challenge3_values_response.json` | Guided questions, case study base text, canonical mapping |
| `frameworks/` | Folder for PNG/JPG assets (Self vs. Others graphic, Values Recognition graphic, Values Response graphic, optional videos) |

Content editors can drop files there without touching Vue code. The front end consumes them via static imports or fetch.

---

## 6. AI Coach Integration

- **Model:** Gemini Flash (existing client-side service) or GPT via similar wrapper.
- **System prompt updates:**
  - Use global terminology (“AI Coach”, “challenge”, “action plan”)
  - Inject participant persona (role, industry, team size) + current challenge context.
  - Provide structured data (scores, quadrant labels) so the model references them instead of inventing.
- **Use cases per challenge:**
  1. Reflecting score interpretations in Challenge 1.
  2. Explaining values quadrants + personalized insights in Challenge 2.
  3. Rewriting case study intros, comparing participant answers to canonical reasoning, and generating action plans in Challenge 3.
- **Configuration:** API key still entered in the settings drawer for now; long term, move to backend.

Fallback: if no API key is set, we can serve scripted responses similar to the current `MockGuruService` but using the new terminology and flows.

---

## 7. UI/UX Requirements

1. **Track selection screen:**
   - Grid of track cards with progress indicators (e.g., “3/3 challenges complete”).
   - Only “Me in My Team” is clickable; others show “Coming soon.”
2. **Challenge layout (desktop & tablet):**
   - Left: scrollable interaction area (forms, chat, guidance).
   - Right: Concept panel toggles between framework images, slide thumbnails, or video embed per step.
   - Top breadcrumb shows track > challenge.
3. **Questionnaire components:**
   - Likert scales, multi-select chips, text inputs.
   - Display running progress (e.g., “Question 5 of 12”).
4. **AI Coach responses:**
   - Continue using chat bubble layout but rename persona to “AI Coach.”
   - Provide quick action buttons where relevant (e.g., “Show me the framework again”).
5. **Gating + success state:**
   - CTA to proceed only after mandatory inputs are complete.
   - Animated unlock message before moving to the next challenge.

---

## 8. Implementation Outline

1. **Content ingestion**
   - Create static content files + TypeScript types.
   - Build helper functions to compute scores/quadrants from responses.
2. **Routing + state**
   - `/tracks` (selection), `/tracks/me-in-my-team/:challengeId`.
   - Track participant progress in Pinia store (persist in localStorage for now).
3. **Challenge components**
   - `ChallengeLayout` (left/right columns, concept panel slot).
   - `SelfVsOthersAssessment`, `ValuesRecognitionAssessment`, `ValuesResponsePractice`.
4. **AI Coach service**
   - Extend existing Gemini service to accept context payload.
   - Add scripted fallback responses matching new flows.
5. **Concept assets**
   - Load framework images from `public/frameworks/`.
   - Provide component for caption + download link if needed.
6. **Action plan module**
   - Shared component to summarize insights and store them in Pinia.
   - Future: sync to backend, send reminders.

---

## 9. Open Items for Content Team

1. Populate the three JSON files with final questions, scoring logic, and interpretation copy.
2. Drop framework images/videos into `product/content/me-in-my-team/frameworks/` using descriptive filenames.
3. Provide the base case study text + canonical solution mapping; include any confidential data handling notes.

Once those assets are in place, engineering can wire the prototype end-to-end.

---

*Last updated:* 2025-11-23
