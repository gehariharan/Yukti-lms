# YUKTI - MVP SPECIFICATION INDEX

This is the main index for the Yukti AI Leadership Coaching Platform MVP specification.

---

## Documentation Structure

The specification is organized into two main documents to separate technical requirements from cultural/branding variants:

### 1. Core Technical Specification
**File:** [`mvp_spec_core.md`](./mvp_spec_core.md)

This document contains the **platform-agnostic technical specification** including:
- Product vision and core concepts
- Technical architecture (Context Engine, RAG, User Persona)
- Complete user journey (Onboarding → Challenge → Dialogue → Action → Reflection)
- UI/UX requirements
- Prompt engineering guidelines
- Admin & analytics features
- Database schema and API requirements
- Sample dialogues for testing

**Use this document for:**
- Technical implementation
- Developer onboarding
- Architecture discussions
- Building the core platform

---

### 2. Indian Knowledge Systems (IKS) Variant
**File:** [`mvp_spec_indian_variant.md`](./mvp_spec_indian_variant.md)

This document describes the **cultural and branding variant** using Indian philosophical frameworks:
- IKS-inspired terminology (Guru, Manthan, Sadhana, Sutra, etc.)
- Philosophical framing from Bhagavad Gita and Brahma Sutras
- Sattvic visual design guidelines
- Sanskrit/Dharmic language in UI/UX
- IKS-specific prompt engineering
- Sample dialogues with IKS terminology

**Use this document for:**
- Branding and marketing (Aaroha-specific)
- UI copy and terminology
- Cultural customization
- Content creation with IKS frameworks

---

## Key Differences

| Aspect | Core Spec | IKS Variant |
|--------|-----------|-------------|
| **AI Persona** | "Coach" | "The Guru" |
| **Challenge** | "Challenge" | "Manthan" (Churning) |
| **Knowledge Base** | "Knowledge Base" | "Granth" (Sacred Text) |
| **Insight** | "Insight" | "Sutra" (Thread/Principle) |
| **Action Items** | "Action Items" | "Sadhana" (Practice) |
| **Reflection** | "Reflection" | "Chintan" (Contemplation) |
| **Visual Style** | Clean minimalist | Sattvic minimalist (Saffron/White/Slate) |
| **Philosophical Framework** | Evidence-based leadership | Gita + Brahma Sutras |

---

## Implementation Approach

1. **Build the core platform** using `mvp_spec_core.md` as the primary technical reference
2. **Apply IKS branding** as a configuration layer using `mvp_spec_indian_variant.md` for:
   - UI labels and terminology
   - Visual theme
   - Prompt engineering additions
   - Content frameworks

This separation ensures:
- Clean technical implementation
- Easy explanation to technical teams
- Ability to create other cultural variants in the future
- Clear distinction between platform features and branding

---

## Version History

**Version 1.0 (MVP)**
- Initial core specification created
- IKS variant documented
- Separated technical and branding concerns

---

## Next Steps

1. Review both specifications
2. Use `mvp_spec_core.md` for technical development
3. Use `mvp_spec_indian_variant.md` for branding/content decisions
4. Validate the separation works for your team's workflow
