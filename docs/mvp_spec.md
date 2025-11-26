# Yukti Learning Platform – MVP Spec (Multi-Tenant)

This document outlines the specifications for **Project Yukti**, a multi-tenant SaaS platform for the Aaroha coaching ecosystem. It details the architecture, data models, and interaction flows required to deliver a personalized, AI-augmented leadership learning experience.

---

## 1. Product Vision
Yukti is a B2B SaaS platform that helps organizations turn leadership theory into practice. Companies (Tenants) onboard their employees (Participants) to go through curated **Learning Tracks**. The platform uses AI to act as a personalized coach, guiding users through challenges, interpreting their responses against proven frameworks, and helping them build actionable leadership habits.

---

## 2. System Architecture & Multi-Tenancy

### 2.1 Multi-Tenant Model
- **Logical Isolation**: The system serves multiple tenants from a single instance.
- **Tenant Identification**: Each tenant has a unique `tenantId`.
- **Data Security**: Firestore Security Rules and Firebase Auth Custom Claims ensure users can only access data belonging to their tenant.

### 2.2 User Roles
| Role | Scope | Permissions |
| --- | --- | --- |
| **Super Admin** | Global | Manage tenants, system-wide configurations, view global analytics. |
| **Tenant Admin** | Tenant | Onboard employees, manage tenant settings (branding, licenses), view tenant analytics. |
| **Employee** | Tenant | Access assigned learning tracks, complete challenges, view personal progress. |

---

## 3. Interaction Model & Knowledge Retrieval

The core experience is a split-screen interface: **Left Pane (Coach/Interaction)** and **Right Pane (Knowledge/Context)**.

### 3.1 The "Semi-Dynamic" Flow
We will use a **Semi-Dynamic** approach for the coaching flows.
- **Structure**: We define the "palette" of question types and the high-level sequence (e.g., "Start with 2 Likert questions, then 1 short text reflection, then a case study").
- **AI Role**: The LLM chooses the exact wording, provides personalized feedback, and decides when to transition based on the user's depth of response, but follows the structural guardrails.

### 3.2 Knowledge Store & Retrieval Strategy
The system maintains a `learning_state` JSON blob that evolves with every turn.

**Input Processing:**
- **Likert Scales**: Converted to numeric values and mapped to semantic tags (e.g., "Low Confidence", "High Team Focus").
- **MCQ**: Selected options are tagged as themes/preferences.
- **Free Text**: LLM extracts emotions, underlying needs, and specific skill gaps.

**Retrieval & Context Injection:**
At each step, the AI receives:
1.  **Current `learning_state`**: The accumulated profile of the user in this session.
2.  **Conversation History**: Recent turns.
3.  **Content Context**: Metadata about the current challenge (e.g., "Values Recognition Framework").

**Session Conclusion:**
When a module is completed, the API is called with the full state to generate:
- **Top 3 Insights**: Personalized takeaways.
- **Action Items**: 3-5 concrete steps.
- **Reflection Questions**: For future thought.
This is returned as JSON to render a "Session Summary" page.

---

## 4. UI/UX Components

### 4.1 Left Pane (The Coach)
The chat interface supports rich interactive widgets, not just text.
- **Chat Bubble**: Can contain text + one of the following interactive elements:
  - **Likert Scale**: Slider or buttons (1-5) with semantic labels (e.g., "Never" to "Always").
  - **Radio/Checkbox**: For single or multi-choice selection.
  - **Text Area**: For open-ended reflection.
- **Controls**: "Continue" button (primary), optional "Skip" (secondary).
- **Progress**: "You’re 40% through this reflective journey."

### 4.2 Right Pane (The Context)
A dynamic slide/card component that updates based on the conversation topic.
- **Content**: Title, Section Headings, Bullet points.
- **Highlight Box**: "Key Insight" or "Coach's Note".
- **Actions**: "Pin for later", "Export to PDF", "Send to email".
- **Media**: Can embed images (framework diagrams) or short videos.

---

## 5. Data Model

### 5.1 Core Collections
- `tenants` (doc per company): Branding, config.
- `users` (doc per user): Profile, role, tenantId.
- `tracks` (global content): Static definitions of modules and challenges.

### 5.2 Session & Progress Tracking
To support the semi-dynamic flow and analytics, we use a granular session model.

```typescript
// Learner's journey through a specific module
interface Session {
  id: string;
  user_id: string;
  tenant_id: string;
  track_id: string;
  module_id: string;
  started_at: Timestamp;
  status: "active" | "completed";
  // The evolving brain of the session
  learning_state: {
    scores: Record<string, number>; // e.g., { "self_focus": 4 }
    themes: string[]; // e.g., ["conflict_avoidant", "empathetic"]
    emotions: string[];
    insights: string[];
  };
}

// A single interaction loop
interface Turn {
  id: string;
  session_id: string;
  question_id: string; // references the static config step
  question_payload: {
    type: "likert" | "text" | "mcq";
    text: string;
    options?: string[];
  };
  user_answer: {
    value: number | string | string[]; // The raw input
    metadata?: any; // Time taken, etc.
  };
  model_output: {
    interpretation: string; // "That's a high score..."
    next_step_trigger: boolean;
    right_pane_update?: {
      title: string;
      content: string;
      image_url?: string;
    };
  };
  created_at: Timestamp;
}
```

---

## 6. Safety & Privacy
Since users may share sensitive workplace dynamics:
- **System Prompts**: Explicitly set boundaries ("I am a leadership coach, not a therapist. If you are in crisis...").
- **Data Minimization**: Prefer storing summarized tags/themes in `learning_state` over raw text where possible.
- **User Control**: "Delete my data" option for specific sessions.

---

## 7. Detailed Track Spec: "Me in My Team"
*(Retained from Prototype Spec v2.0)*

This is the flagship track for the MVP.

### 7.1 Challenge 1 – Self vs. Others Reflection Tool
- **Goal:** Help participant understand their leadership focus (Self vs. Team).
- **Flow:**
  1. **Input**: Likert scale questionnaire.
  2. **Process**: Calculate score, map to "Self-Driven" or "Team-Aligned".
  3. **Output**: AI Coach explains result; Concept Panel shows framework.

### 7.2 Challenge 2 – Values Recognition
- **Goal:** Teach observation of values signals in teammates.
- **Flow:**
  1. **Input**: Assess two teammates (Person A & B) against prompts.
  2. **Process**: Map teammates to **Values Recognition Quadrants**.
  3. **Output**: AI Coach reflects patterns; Concept Panel shows quadrant map.

### 7.3 Challenge 3 – Values Response Framework
- **Goal:** Practice responding to different value archetypes.
- **Flow:**
  1. **Input**: User drafts responses for Person A & B.
  2. **AI Interaction**: AI acts as the teammate, reacting to the user's response based on their archetype.
  3. **Feedback**: AI compares user's approach to canonical best practices.

---

## 8. Build Roadmap (Phased)

### Phase 1 – Prototype (1–2 Weeks)
- **Goal**: Basic web app with split screen and one hard-coded linear flow.
- **Tech**: Vue 3 + Firebase (Auth/Firestore).
- **AI**: One API call per step. Input: `latest_answer` + `summary`. Output: `insight` + `right_pane_spec`.
- **Deliverable**: "Me in My Team" module working end-to-end with session summary.

### Phase 2 – Structured Outputs & Rich Inputs
- **Goal**: Robust data handling.
- **Tech**: Implement JSON Schema for AI responses (Structured Outputs).
- **UI**: Build generic `Likert`, `MCQ`, `TextInput` widgets driven by the schema.
- **State**: Implement the `learning_state` update logic.

### Phase 3 – Rich Content Routing
- **Goal**: Dynamic knowledge retrieval.
- **Tech**: Add tool/function `get_resources_by_tags(tags[])`.
- **Flow**: LLM calls tool -> System fetches framework assets -> Right pane updates dynamically.

### Phase 4 – Personalization & Scale
- **Goal**: Multi-module and user context.
- **Tech**: User profiles + Goal setting.
- **Flow**: System recommends modules based on `learning_state` history.
