Yukti – A conversational and challenge based learning experience  



1. Product Vision

Yukti helps participants turn leadership theory into practice. Each participant selects a Learning Track (e.g., “Me in My Team”) and works through a sequence of Challenges. Every challenge is a guided experience that mixes:

Structured inputs (questionnaires, sliders, multi-select, free text)

Interpretations of the participant’s responses mapped to proven frameworks

Concept visuals/videos displayed alongside the dialogue

An AI responder who personalizes the conversation with the participant’s role, industry, and recent answers

Action items that unlock the next challenge

The prototype should demonstrate this full loop for one track while making space in the UI to preview other tracks.



2. Key Terminology (global naming)

Learning Tracks : A curated sequence of challenges themed around a leadership capability (e.g., “Me in My Team”) 

Challenge : A gated learning module inside a track; includes assessments, AI dialogue, and assets (Cogs) 

Participant : The learner; the onboarding flow captures their name, role, team size, and industry 

AI Responder The conversational agent (Gemini/GPT) that probes, interprets scores, and narrates 

Concept Panel The right-side panel that showcases framework images, slides, or short clips

Action Plan The set of commitments or reflections at the end of a challenge 



3. Track Catalog (MVP view)

For demo purposes the home screen shows four track cards:

Aaroha Leader : Drg Drishya Viveka

Aaroha Leader : Swadharma

Aaroha Teams : Me in My Team – (active track with full prototype)

Aaroha Organization : Lead at an Organization Level 

Post MVP 

Aaroha Teams : Me and my Team – (Collaborative async/sync Learning experience )



7. UI/UX Requirements

Onboarding experience :

Onboarding the Organization and individual learner to capture the context of the organization and learner .

Track selection screen:

Grid of track cards with progress indicators (e.g., “3/3 challenges complete”).

Eg  Track : Me in my team 

Challenge layout (desktop & tablet):

Collaborative Learning Area - Left: scrollable interaction area (forms, chat, guidance). Learner learns along with AI in a conversational pattern.

Right: Concept panel toggles between framework slides, or videos embed relevant to the conversational topic

Top breadcrumb shows track > challenge.

Conversational experience 

Rich cards, Questionnaires (Likert scales, multi-select chips), Text inputs.

Display running progress (e.g., “Question 5 of 12”).

AI Coach responses:

Continue using chat bubble layout but rename persona to “AI Coach.”

Provide quick action buttons where relevant (e.g., “Show me the framework again”).

Gating + success state:

CTA to proceed only after mandatory inputs are complete.

Animated unlock message before moving to the next challenge.





4. Track Detail – “Me in My Team”

This track contains three sequential challenges. Participants must complete each challenge to unlock the next.

4.1 Challenge 1 – Self vs. Others Reflection Tool

Goal: Help the participant understand whether they lead primarily from self-focus or team-focus.

Flow

Present a questionnaire (Likert scale). Static config contains:

Question text

Scale labels (e.g., 1–5)

Scoring weights

On submission, compute total and map to one of four segments (e.g., “Self-Driven,” “Team-Aligned,” etc.) using the interpretation table supplied by content.

Display interpretation:

AI Coach summarizes what the score means in the participant’s industry/role.

Concept panel shows the “Self vs. Others in Leadership” framework image.

Highlight where the participant falls on the framework (textual indicator for now).

Unlock Challenge 2 with a CTA (“Continue to Values Recognition”).

4.2 Challenge 2 – Values Recognition

Goal: Teach the participant to observe values signals inside their team.

Flow

Participant enters two teammates (Person A & Person B).

Each teammate is assessed against a fixed set of prompts/questions (static config).

For every teammate, compute which Values Recognition quadrant they fall into.

Outputs:

AI Coach reflects back the patterns (“Person A leans toward ‘Stability & Order’ because…”).

Concept panel displays the Values Recognition framework image.

Action plan section encourages notes per teammate.

Unlock Challenge 3.

4.3 Challenge 3 – Values Response Framework + Case Study

Goal: Practice responding to different value archetypes with supportive + challenging behaviors.

Flow

Participant reuses Person A & B (or edits them).

Guided questions collect how the participant currently supports/challenges each teammate.

Introduce Values Response Framework (image). AI Coach explains the four response strategies and maps each teammate to the recommended quadrant.

Case study practice:

Content contains one base case study + canonical mapping to the four response frameworks + sample answers.

AI Coach rewrites the case study intro to match the participant’s industry/role (simple prompt templating).

Participant answers how they would apply each response strategy.

AI Coach compares answers to the canonical guide and provides feedback.

Conclude with an action plan summarizing:

Key insight per teammate

Next support/challenge experiment

A reminder to revisit after one week (placeholder for future reminders).



6. AI Coach Integration

Model: Gemini Flash (existing client-side service) or GPT via similar wrapper.

System prompt updates:

Use global terminology (“AI Coach”, “challenge”, “action plan”)

Inject participant persona (role, industry, team size) + current challenge context.

Provide structured data (scores, quadrant labels) so the model references them instead of inventing.

Use cases per challenge:

Reflecting score interpretations in Challenge 1.

Explaining values quadrants + personalized insights in Challenge 2.

Rewriting case study intros, comparing participant answers to canonical reasoning, and generating action plans in Challenge 3.

Configuration: API key still entered in the settings drawer for now; long term, move to backend.

Fallback: if no API key is set, we can serve scripted responses similar to the current MockGuruService but using the new terminology and flows.



8. Implementation Outline

Content ingestion

Create static content files + TypeScript types.

Build helper functions to compute scores/quadrants from responses.

Routing + state

/tracks (selection), /tracks/me-in-my-team/:challengeId.

Track participant progress in Pinia store (persist in localStorage for now).

Challenge components

ChallengeLayout (left/right columns, concept panel slot).

SelfVsOthersAssessment, ValuesRecognitionAssessment, ValuesResponsePractice.

AI Coach service

Extend existing Gemini service to accept context payload.

Add scripted fallback responses matching new flows.

Concept assets

Load framework images from public/frameworks/.

Provide component for caption + download link if needed.

Action plan module

Shared component to summarize insights and store them in Pinia.

Future: sync to backend, send reminders.



9. Open Items for Content Team

Populate the three JSON files with final questions, scoring logic, and interpretation copy.

Drop framework images/videos into product/content/me-in-my-team/frameworks/ using descriptive filenames.

Provide the base case study text + canonical solution mapping; include any confidential data handling notes.

Once those assets are in place, engineering can wire the prototype end-to-end.



Last updated: 2025-11-23