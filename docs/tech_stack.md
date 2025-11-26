# Yukti Learning Platform - Technology Stack

## 1. Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
  - Used for transient session state (`learning_state`) before syncing to Firestore.
- **Routing**: Vue Router
- **Icons**: Lucide Vue Next
- **Markdown Rendering**: `markdown-it` + `highlight.js` (for rendering Right Pane content and AI responses).
- **Schema Validation**: `zod` (for validating AI structured outputs and form inputs).
- **HTTP Client**: Fetch API / Axios (if needed)

## 2. Backend (Serverless)
- **Platform**: Firebase
- **Authentication**: Firebase Auth
  - **Strategy**: Email/Password, Google Workspace (OIDC) for corporate login.
  - **Custom Claims**: Used for `tenantId` and `role` (Super Admin, Tenant Admin, Employee).
- **Database**: Cloud Firestore (NoSQL)
  - **Data Model**: Multi-tenant architecture using `tenantId` field for logical isolation.
  - **Collections**: `tenants`, `users`, `sessions` (stores the full `learning_state` JSON), `tracks`.
- **Server-side Logic**: Cloud Functions for Firebase (2nd Gen)
  - **AI Proxy**: Securely routes requests to LLMs and injects system prompts.
  - **State Management**: Aggregates session data into insights upon module completion.
  - **Triggers**: Background tasks for analytics and notifications.
- **Storage**: Cloud Storage for Firebase
  - Tenant-specific folders for assets/uploads.
- **Hosting**: Firebase Hosting

## 3. AI & LLM Integration
- **Orchestration**: Server-side via Cloud Functions.
- **Primary Model**: open AI GPT5
- **Capabilities Required**:
  - **Structured Outputs (JSON Mode)**: Essential for generating the `learning_state` updates and UI specifications reliably.
  - **Function Calling**: For retrieving knowledge base articles or framework assets.
- **Prompt Engineering**:
  - **System Prompts**: Stored as versioned text files or in Remote Config.
  - **Context Window**: Must support large context for maintaining full conversation history.

## 4. Content & Knowledge Management
- **Static Content**: "Track" definitions (JSON) and "Framework" assets (Markdown/Images) stored in the repository (`/product/content`).
- **Dynamic Retrieval**:
  - **Vector Search** (Future): For retrieving relevant case studies based on user tags.
  - **Tagging System**: Content tagged with metadata (e.g., `theme:conflict`, `role:manager`) for AI tool retrieval.

## 5. Multi-Tenancy Strategy
- **Isolation Level**: Logical Isolation.
- **Implementation**:
  - **Users**: All users in a single Firebase Auth project. Custom claims store `tenantId`.
  - **Data**: Firestore documents tagged with `tenantId`. Security Rules enforce `request.auth.token.tenantId == resource.data.tenantId`.
  - **Config**: `tenants` collection stores company branding (logo, colors) and subscription settings.

## 6. DevOps & Tooling
- **Version Control**: Git (GitHub)
- **CI/CD**: GitHub Actions (Build, Test, Deploy to Firebase)
- **Linting/Formatting**: ESLint, Prettier
- **Testing**: Vitest (Unit), Cypress/Playwright (E2E - Future)
