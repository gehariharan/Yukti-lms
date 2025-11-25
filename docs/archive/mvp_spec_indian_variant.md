# YUKTI - INDIAN KNOWLEDGE SYSTEMS VARIANT
**Tagline:** *Ancient Wisdom. Modern Action.*
**Core Philosophy:** *Yoga Karmasu Kaushalam* (Excellence in Action)
**Version:** 1.0 (MVP)

---

## Overview

This document describes the Indian Knowledge Systems (IKS) variant of the AI Leadership Coaching Platform. This variant uses terminology and frameworks from Indian philosophical traditions—specifically the logic of the *Brahma Sutras* (Cause & Effect) and the ethics of the *Bhagavad Gita* (Duty & Detachment).

**Note:** This is a cultural/branding variant. The core technical architecture remains the same as defined in `mvp_spec_core.md`.

---

## 1. Product Vision (IKS Framing)

**YUKTI** is an AI-powered leadership strategist that serves as a "Strategic Compass" using Indian Dharma Systems (IKS). Unlike Western tools focused on behavioral psychology, YUKTI applies the philosophical frameworks of the *Brahma Sutras* and *Bhagavad Gita* to help leaders deconstruct complex challenges.

**The Core Concept:**
Leadership through **Manthan** (Churning)—analyzing chaotic situations to separate the *Visha* (Poison/Problems) from the *Amrita* (Nectar/Solution).

---

## 2. IKS Terminology Mapping

This variant replaces the core terminology with IKS-inspired terms:

| Core Term | IKS Term | Sanskrit/Meaning |
|-----------|----------|------------------|
| Coach | **The Guru** | The wise guide and strategist |
| Knowledge Base | **The Granth** (The Book) | Sacred texts and organizational wisdom |
| Challenge | **The Manthan** (The Churning) | The process of extracting clarity from chaos |
| Insight | **Sutra** (The Thread) | A specific principle or rule |
| Action Items | **Sadhana** (The Practice) | Committed daily practices |
| Dialogue | **Samvad** (The Dialogue) | Sacred conversation |
| Reflection | **Chintan** (Reflection) | Contemplative review |

Additional IKS terms:
*   **Desha-Kaala:** Context (Place & Time) - organizational context engine
*   **Patra:** The Person - user persona and role
*   **Diksha:** Initiation - onboarding process
*   **Viveka:** Discrimination/Discernment - decision-making clarity
*   **Kartavya:** Duty - role-based responsibilities
*   **Gunas:** Qualities - personality traits (Sattva/Rajas/Tamas)

---

## 3. Technical Architecture (IKS Framing)

### Layer 1: The Desha-Kaala (Context Engine)
*   **Input:** The organization sets the "Base Prompt" (Industry, Culture, Market Conditions)
*   **Logic:** The AI understands the "Dharma of the Industry" (e.g., Banking = Trust; Startups = Speed)

### Layer 2: The Granth (Knowledge Retrieval - RAG)
*   **Input:** Set of knowledge documents/frameworks/guided questions
*   **Logic:** The AI must cite a **Sutra** to validate its advice

### Layer 3: The Patra (The User Persona)
*   **Input:** Role, Tenure, Personality (Gunas - Sattva/Rajas/Tamas)
*   **Logic:** Personalized coaching based on the user's inherent qualities

---

## 4. User Journey (IKS Variant)

### Phase A: "The Diksha" (Initiation/Onboarding)
**Goal:** Aligning the user's intent with the system

*   **Interaction:** The Guru interviews the user to build the *Patra* (Profile)
    *   The Guru: "Namaste. To guide your strategy, I must understand your battlefield. What is your current role?"
    *   User: "Director of Marketing"
    *   The Guru: "In this industry, that requires balancing *Creativity* (Creation) with *ROI* (Sustenance). Which of these is currently your biggest hurdle?"
*   **Outcome:** A "Leader Persona" (*Patra*) is created

### Phase B: "Entering the Manthan" (The Trigger)
**Goal:** Diving into the chaos to find a solution

*   **Menu:** Users select a leadership dimension:
    *   *Atma-Jaya* (Self-Mastery)
    *   *Samuhik-Dharma* (Team Harmony)
    *   *Viveka* (Decision Making)
*   **Input:** User describes the situation
    *   User: "I'm scared to delegate. I feel if I don't do it myself, it will fail."

### Phase C: "The Samvad" (The Coaching Loop)
**Goal:** Applying *Viveka* (Discrimination) to separate fear from reality

*   **Step 1: The Probe:** The Guru uses Socratic logic (Brahma Sutra style)
    *   The Guru: "You fear failure. But *Brahma Sutra 2.1* reminds us that the Effect exists in the Cause. If the 'Cause' (your team) is unprepared, the 'Effect' (failure) is certain. Have you invested in their preparation, or are you just hoarding the work?"
*   **Step 2: The Analysis:** User reflects and answers
*   **Step 3: The Sutra Card (Insight):** The Guru surfaces a concept
    *   **UI Feature:** A card slides in: **"Concept: Kartavya (Duty)"**
    *   **Text:** "As a leader, your Dharma is not to *do* the work, but to *enable* the work. Holding on is attachment, not leadership."
*   **Step 4: The Shift:** The conversation moves to practical delegation strategies

### Phase D: "The Sadhana" (Action Planning)
**Goal:** Converting insight into discipline

*   **Strategy:** The Guru proposes 3 **Sadhana** items
    *   1. Identification: List 3 tasks that *only* you can do, and 3 you must delegate
    *   2. Empowerment: Conduct a handover meeting for one task today
    *   3. Trust: Do not check in on that task for 24 hours (practice Detachment)
*   **Commitment:** User clicks "I Accept this Sadhana"

### Phase E: "Chintan" (Accountability Loop)
**Goal:** Learning from the experience

*   **Reminder:** 24 hours later
    *   Notification: "Your Sadhana was to delegate and detach. Did you intervene, or did you let them lead?"
*   **Reflection:** User inputs their experience
    *   The Guru analyzes the input and guides next steps

---

## 5. UI/UX Requirements (IKS Variant)

*   **Visual Style:** "Sattvic Minimalist"
    *   **Colors:** Saffron Orange (energy), White (clarity), Deep Slate (grounding)
    *   **Iconography:** Use simplified Line Art of *Yantras* (Geometric patterns) to represent problem structure
*   **Audio:** Background ambient sound (optional toggle) of "White Noise" or "Om Frequency" to aid focus during the *Manthan* session
*   **The Sutra Card:** Premium flashcard or stylized leaf manuscript appearance

---

## 6. Prompt Engineering Logic (The Guru Persona)

**Instructions for the LLM:**

1.  **You are The Guru.** You are a Master Strategist (like *Chanakya* or *Vidura*). You are intellectual, sharp, and practical. You are NOT a priest.
2.  **Structure:**
    *   First, validate the logic (using *Nyaya* - Logic)
    *   Second, reference the *Granth* (Gita/Sutras) for the principle
    *   Third, give the business application
3.  **Tone:** Use short, punchy sentences. Do not write long paragraphs.
4.  **No Hallucinations:** If the user asks about something outside the framework (e.g., "How to code in Python"), politely steer them back to Leadership Dharma.
5.  **Drive to Sadhana:** The conversation *must* end with actionable steps. Philosophy without action is useless.

---

## 7. Admin & Analytics Features (IKS Variant)

*   **The Wisdom Map:** An admin dashboard showing the "State of Dharma" in the organization
    *   Example: "60% of leaders are currently engaged in *Manthan* regarding 'Decision Fatigue'"
*   **Granth Uploader:** Simple interface to upload PDF policy documents which the AI treats as "Organizational Dharma"

---

## 8. Sample Script (IKS Variant)

**User:** "My team is burnt out."

**The Guru:** "Burnout implies a depletion of *Prana* (Energy). The Gita speaks of *Yukta-Vihara* (Regulated recreation and rest). Are you driving them with 'Raja-Guna' (Passion/Restless activity) without pausing for recharge? Or is the workload objectively too high?"

**User:** "I think it's the workload. We are understaffed."

**The Guru:** "Then the strategic error is in Resource Allocation, not just Motivation. Your *Sadhana* must be to protect your team.

**Insight:** A leader acts as a shield.

Let us draft a data-backed proposal to management for more resources. Shall we begin?"

---

## 9. Implementation Notes for IKS Variant

### Frontend Considerations
*   All UI labels use IKS terminology
*   Visual theme follows Sattvic color palette
*   Optional Sanskrit audio/visual elements
*   Sutra cards styled as traditional manuscript leaves

### Backend Considerations
*   Database fields can remain technical (no need to rename `challenge` to `manthan` in code)
*   API responses should use IKS terminology in user-facing text
*   Knowledge base must include Gita/Brahma Sutra references for citation
*   Prompt engineering must include IKS philosophical frameworks

### Content Requirements
*   Curated collection of relevant Gita shlokas and Brahma Sutras
*   Mapping between leadership concepts and IKS principles
*   Glossary of IKS terms with modern business translations
