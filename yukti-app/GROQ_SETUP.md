# Groq AI Integration Setup

This guide explains how to set up and use Groq AI for dynamic coach responses in the Yukti learning platform.

## Getting Your Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

## Configuration

### Option 1: Environment Variable (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   VITE_GROQ_API_KEY=your_actual_groq_api_key_here
   ```

3. Restart the dev server if it's running

### Option 2: Settings Panel

1. Open the Yukti app
2. Click the Settings icon (gear) in the header
3. Select "Groq AI" mode
4. Enter your API key in the Groq API Key field
5. Click "Save Changes"

## Using Different Modes

The platform supports three coach modes:

### 1. **Demo Mode** (Default)
- Uses pre-scripted, hardcoded responses
- Perfect for demos and testing
- No API key required
- Fast and predictable

### 2. **Groq AI Mode**
- Uses Groq's fast LLM inference
- Dynamic, personalized responses
- Requires API key
- Model: llama-3.3-70b-versatile

### 3. **Gemini Mode**
- Uses Google's Gemini AI
- Alternative AI option
- Requires separate Gemini API key

## Switching Modes

**Quick Toggle:**
Click the mode button in the header to cycle through: Demo → Groq AI → Gemini

**Settings Panel:**
Use the settings panel for more control and to enter API keys

## How It Works

When in Groq AI mode during onboarding:
- Aaroha Coach generates contextual responses based on your inputs
- The system maintains conversation history for coherent dialogue
- Responses are personalized to your name, role, industry, and team size
- If Groq API fails, it falls back to scripted responses

## System Prompt

The Groq integration uses a carefully crafted system prompt that:
- Defines Aaroha's coaching personality
- Provides context about the learner
- Sets guidelines for response length and tone
- Ensures engaging, concise coaching conversations

## Troubleshooting

**"Failed to generate response from Groq API"**
- Check your API key is correct
- Verify you have Groq API credits
- Check your internet connection
- The system will fallback to demo mode automatically

**Responses seem generic**
- Make sure you're providing detailed information during onboarding
- The AI uses your context to personalize responses

**Mode not switching**
- Save changes in the settings panel
- Refresh the page if needed

## Cost Considerations

- Groq offers generous free tier credits
- Each onboarding conversation uses ~5-10 API calls
- Estimated cost: negligible for testing/demos
- Production use: monitor your usage at console.groq.com

## Development Notes

The Groq integration is in:
- `src/services/groq.js` - Groq service wrapper
- `src/views/OnboardingView.vue` - Onboarding integration
- `src/stores/learningStore.js` - State management
- `src/components/layout/AppShell.vue` - Settings UI
