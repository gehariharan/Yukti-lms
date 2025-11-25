# Spec : AI assisted Leadership Development Coaching Platform
**Version:** 1.0 (MVP)

---

## 1. Product Vision

The platform helps leaders deconstruct complex challenges through structured dialogue, evidence-based frameworks, and actionable accountability.

**The Core Concept:**
Leadership development through analytical problem-solving—helping leaders analyze chaotic situations to separate problems from solutions through systematic inquiry and reflection.

---

## 2. Core Terminology

**Platform Terminology:**
*   **Coach:** The AI Persona - strategic, wise, and incisive
*   **Knowledge Base:** Organizational frameworks, leadership principles, and company policies
*   **Challenge:** The specific scenario or problem the user is solving
*   **Insight:** A specific principle or rule derived from the coaching framework (For eg: Aaroha teams, Aaroha Self etc. )
*   **Action Items:** The actionable tasks the user commits to
*   **Dialogue:** The coaching chat interface/conversation ( Its not a chat bot kind of UX, it is more like a coaching session with side by side ux)
*   **Insight Card:** The insight card is a premium card design appearing on screen when AI gives key advice in the side of the chat interface
*   **Reflection:** The review process after action is taken

---

## 3. Technical Architecture

### Layer 1: Uber Context Engine
*   **Input:** Organization sets the "Base Prompt" (Industry, Culture, Market Conditions)  - We get this when we onboard a company - so tenant specific 
*   **Logic:** The AI understands industry-specific contexts (e.g., Banking = Trust & Compliance; Startups = Speed & Innovation)


### Layer 2: Leadership Coaching Framework/Content Knowledge Retrieval (RAG Based)
*   **Input:** Knowledge documents, frameworks, guided questions for different learning items - This is common for all tenants of the coaching company and specifics of the Coaching company (Here Aaroha)
*   **Logic:** The AI must cite specific principles to validate its advice
*   **Requirements:** Document upload, indexing, and citation tracking

### Layer 3: User Persona 
*   **Input:** Role, Tenure, Personality traits (e.g., analytical/collaborative/decisive). This is customer/learner specific, when a learner onbards into the system, we get this information 
*   **Logic:** Personalized coaching based on leadership style and context

---

## 4. User Journey & Feature Set

### Phase A: Onboarding
**Goal:** Aligning the user's intent with the system

*   **Interaction:** The Coach interviews (or questionaire based) the user to build their profile
    *   Example: "Hello. To guide your strategy, I need to understand your context. What is your current role?"
    *   User: "Director of Marketing"
    *   Coach: "In this role, you balance creativity with ROI. Which of these is currently your biggest challenge?"
*   **Outcome:** A "Leader Persona" is created in the backend

### Phase B: Challenge Selection
**Goal:** Diving into the specific problem

*   **Menu:** Users select a leadership dimension: ( These are visual challenge cards for the user to pick from )
    *   Self-Mastery
    *   Team Management
    *   Decision Making
    *   Strategic Thinking
*   **Input:** User describes the situation
    *   Example: "I'm scared to delegate. I feel if I don't do it myself, it will fail."

### Phase C: Coaching Dialogue
**Goal:** Applying analytical reasoning to separate fear from reality

*   **Step 1: Probe:** The Coach uses the questionaire already used for that challenge (usually this is like the questions give in the handout during in person trainingn program )
    *   Example: "You fear failure. But if your team is unprepared, failure is inevitable. Have you invested in their preparation, or are you avoiding delegation?"
*   **Step 2: Analysis:** User reflects and answers
*   **Step 3: Insight Card:** The Coach surfaces a concept
    *   **UI Feature:** A card displays: **"Concept: Role Clarity"**
    *   **Text:** "As a leader, your role is not to do the work, but to enable the work. Holding on shows attachment, not leadership."
*   **Step 4: Strategy:** The conversation moves to practical solutions

### Phase D: Action Planning
**Goal:** Converting insight into discipline

*   **Strategy:** The Coach proposes 3 action items
    *   1. Identification: List 3 tasks that only you can do, and 3 you must delegate
    *   2. Empowerment: Conduct a handover meeting for one task today
    *   3. Trust: Do not check in on that task for 24 hours (practice delegation)
*   **Commitment:** User accepts the action plan

### Phase E: Accountability Loop
**Goal:** Learning from the experience

*   **Reminder:** 24 hours later
    *   Notification: "Your action was to delegate and trust. Did you intervene, or did you let them lead?"
*   **Reflection:** User inputs their experience
    *   Coach analyzes the input. If successful, reinforces the behavior. If failed, suggests a smaller step next time.

---

## 5. Experience  Requirements

*  **Org Onboarding:**    - Initial onboarding flow for organization - its set by the coaching Company (Aaroha) with details of the organization and the industry details 
*  **User Onboarding:**   - Initial onboarding flow for user - its set by the coaching Company (Aaroha) with details of the user and the industry details 
*  **Challenge Selection:** - 
    - After onboarding show a personalized set of Challenges cards  to the learner (this is personalized based on the company and the program they sign up for )
    - Clicking every challenge cards open a chat like interface in the left and concept cards in the right when neeeded (Side by Side UX)
    - Each response in the chat card - are not plain text only - but rather a combination of card types -> Multiple choice, question with text box for the learner to fill, canvas to draw.. (think of different input types a handout is designed with)
    - End of the chat interaction shows an action item template - which convets to a Set of Action items (stored in the backend) and shows them as a summary learning with option for reminders. 
    - Reminders can be push notification (if we build an app) or Email/Whatsapp

---

## 6. Prompt Engineering Logic (Coach Persona)

**Instructions for the LLM:**

1.  **You are The Coach.** You are a master strategist. You are intellectual, sharp, and practical. You are a coach who is helping a learner to understand the leadership principles and apply them in their work. ( Here we can insert Aaroha specific guidance eg : use Bhagavadgita, brahmasutra etc. )
2.  **Structure:**
    *   First, validate the logic through questioning
    *   Second, reference the knowledge base for principles
    *   Third, give the business application
3.  **Tone:** Use short, punchy sentences. Avoid long paragraphs.
4.  **No Hallucinations:** If the user asks about something outside the framework, politely steer them back to leadership topics.
5.  **Drive to Action:** The conversation must end with actionable steps. Theory without practice is useless.

- **Need to add more details on the Prompting**
---

## 7. Admin & Analytics Features

*   **Insights Dashboard:** An admin dashboard showing organizational patterns
    *   Example: "60% of leaders are currently addressing 'Decision Fatigue'"
*   **Knowledge Uploader:** Simple interface to upload PDF policy documents which the AI treats as organizational guidelines
*   **Usage Analytics:** Track engagement, completion rates, common challenges

---

## 8. Sample Dialogue (For Developer Testing)

**User:** "My team is burnt out."

**Coach:** "Burnout implies energy depletion. Research shows the importance of regulated work-rest cycles. Are you driving them with constant activity without breaks? Or is the workload objectively too high?"

**User:** "I think it's the workload. We are understaffed."

**Coach:** "Then the strategic error is in resource allocation, not just motivation. Your responsibility is to protect your team.

**Insight:** A leader acts as a shield.

Let us draft a data-backed proposal to management for more resources. Shall we begin?"

---

## 9. Technical Implementation Notes

### Database Schema Requirements
*   User profiles (role, tenure, personality traits)
*   Challenge sessions (challenge type, dialogue history, insights surfaced)
*   Action items (committed actions, due dates, reflection inputs)
*   Knowledge base (documents, citations, principles)
*   Organization context (industry, culture, base prompt)

### API Endpoints Needed
*   User onboarding & profile creation
*   Chat/dialogue management
*   Knowledge retrieval (RAG)
*   Action item tracking
*   Reflection & accountability
*   Admin analytics

### AI/LLM Integration
*   Context management (organization + user persona + knowledge base)
*   Citation tracking (ensure insights are grounded in knowledge base)
*   Conversation flow control (probe → analyze → insight → action)
*   Tone consistency (strategic coach persona)
- **Need to add more details on the AI/LLM Integration**
