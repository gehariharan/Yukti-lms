# Per-track: what you define once

For each track (e.g. “Me in my team”, “Leading at Scale”, “Swadharme”) you define:
- Track metadata
- Question bank
- Response evaluation rules
- Card types / UI config
- Frameworks + images +  Videos to show on the right pane

Store each track in Firestore as a document.


## Question bank (per track)

This is the heart of the track. For each question in the bank:

- id: unique string
- text: the actual wording
- type: "likert" | "mcq" | "checkbox" | "short_text" | "long_text" | "case_reflection"
- stage: "start" | "middle | "end" (or more granular if you like)
- tags: themes (e.g. ["feedback", "safety"])
- options: (for MCQ / checkbox)
- scale_min, scale_max, scale_min_label, scale_max_label: (for Likert)
- depends_on: optional list of question IDs or tags (for branching)
- weight or priority: if some questions are more important

### Example 
The model only chooses from these (as we set in the prompt).

    "question_bank": [
    {
        "id": "goals_01",
        "text": "What do you hope to gain from this track?",
        "type": "long_text",
        "stage": "start",
        "tags": ["goals", "orientation"]
    },
    {
        "id": "safety_likert_01",
        "text": "On a scale of 1–5, how psychologically safe do you currently feel at work?",
        "type": "likert",
        "stage": "start",
        "tags": ["psychological_safety"],
        "scale_min": 1,
        "scale_max": 5,
        "scale_min_label": "Not safe",
        "scale_max_label": "Very safe"
    },
    {
        "id": "feedback_case_01",
        "text": "Describe a recent situation where you wanted to give feedback but held back.",
        "type": "case_reflection",
        "stage": "middle",
        "tags": ["feedback", "conflict"]
    }
    ]

## Response evaluations (per track)
Two layers:

### Global rubric (usually same across tracks)

    Things like:
        depth_of_reflection: "superficial" | "moderate" | "deep"
        emotional_tone: one of ["avoidant","anxious","conflicted","hopeful","determined","resigned","calm"]
        readiness_stage: "precontemplation" | "contemplation" | "preparation" | "action" | "maintenance"
        confidence_level: "low" | "medium" | "high"
        themes: tags like ["feedback","values","team_dynamics"]

Tell the model how to use this in the system prompt.

##  Per-question / per-tag eval guidelines
    (Optional). For each question (or tag)  define how to interpret answers:
       For Likert:
        1–2 → “low safety, flag ‘psychological_safety’ and ‘anxious’”
        4–5 → “higher safety, maybe move toward action planning”
        For MCQ / checkbox:
        Map options to tags (e.g. picking “fear of retaliation” adds ["power_dynamics"])
        For reflection questions:
            Look for patterns (e.g. “blame self” vs “blame others” vs “systems”).
            Encode this as config the model reads in the prompt, or just describe it in text as EVAL_GUIDELINES for this track.
### Example snippet in the track object

    "response_evals": {
    "global_rubric": {
        "depth_of_reflection": ["superficial", "moderate", "deep"],
        "emotional_tone_options": ["avoidant", "anxious", "conflicted", "hopeful", "determined", "resigned", "calm"],
        "readiness_stages": ["precontemplation", "contemplation", "preparation", "action", "maintenance"]
    },
    "per_question_rules": {
        "safety_likert_01": {
        "low_range": [1, 2],
        "high_range": [4, 5],
        "low_range_effects": {
            "themes_add": ["psychological_safety"],
            "emotional_tone_hint": "anxious"
        }
        }
    }
    }
Pass response_evals into the user content for the model to respect.
## Card types / UI config (per track)

For frontend,  Per track we will define:

- Which question types are allowed: allowed_question_types: ["likert","mcq","checkbox","short_text","case_reflection"]
- Any styling variations: emphasis_card_for: e.g. "case_reflection" shows bigger card, more space
- Any constraints:  “In this track, max 2 Likert questions per turn” (you can use this in the prompt)

        "ui_config": {
        "allowed_question_types": ["likert", "mcq", "short_text", "long_text", "case_reflection"],
        "max_questions_per_turn": 3,
        "max_likert_per_turn": 2,
        "highlight_types": ["case_reflection"]
        }


Vue app then knows which components to use:
* likert → LikertQuestion.vue
* mcq → McqQuestion.vue
* checkbox → CheckboxQuestion.vue

### Frameworks & images (per track)

This is for the right pane. For each track, define a set of frameworks / visuals:

- id: "nvc_feedback", "values_behaviours_matrix", etc.
-title
-tags: link to question tags (so model can pick).
-summary_bullets: what to show as bullets.
-image_url / Youtube URL (if you have a static image/diagram)
-use_cases: when it should be used (e.g. low safety + high desire to speak up)

Example

            "frameworks": [
            {
                "id": "nvc_feedback",
                "title": "Nonviolent Communication for Feedback",
                "tags": ["feedback", "conflict"],
                "summary_bullets": [
                "Observe: Describe what you saw or heard without judgments.",
                "Feel: Name the emotion you are experiencing.",
                "Need: Connect to what matters to you.",
                "Request: Ask for a clear, doable next step."
                ],
                "image_url": "https://cdn.example.com/frameworks/nvc.png"
            },
            {
                "id": "safety_zones",
                "title": "Zones of Psychological Safety",
                "tags": ["psychological_safety"],
                "summary_bullets": [
                "Panic zone: high threat, low learning.",
                "Comfort zone: low threat, low learning.",
                "Learning zone: challenge with support."
                ],
                "image_url": "https://cdn.example.com/frameworks/safety_zones.png"
            }
            ]
The model:
- Sees the learner’s themes/evals.
- Picks a framework via tags.
- Fills right_pane.sections using summary_bullets, and optionally includes framework_id.
- Frontend: Renders bullets, and if image_url exists, also shows the image.

## A Track Object 
            {
            "id": "feedback_manager_track",
            "name": "Feedback to My Manager",
            "description": "Support leaders to speak up with managers in a values-aligned way.",
            "question_bank": [ /* ... as above ... */ ],
            "response_evals": { /* global rubric + per-question rules */ },
            "ui_config": { /* allowed types, per-turn limits etc. */ },
            "frameworks": [ /* frameworks + images */ ]
            }
Load this track, send relevant parts into the LLM (question_bank/available_questions + response_evals + maybe frameworks metadata), and  Vue app uses the same spec to know:
    - Which cards to render for which question types
    - Which framework cards / images to show on the right when the model references a framework