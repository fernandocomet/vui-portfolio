# VUI Portfolio — Fernando Comet

A voice-first portfolio experience built as a single HTML file. Visitors interact with a conversational AI assistant that knows Fernando's background, projects, services, and skills — all through speech, no typing required.

**[Live demo →](https://vui-portfolio.vercel.app/)**

---

## What it does

You tap an animated orb and speak. The assistant listens, understands your question, and answers out loud using a natural voice. The orb changes colour and animation to reflect the current state: ready, listening, thinking, or speaking.

---

## How it works

```
User speaks → Web Speech API (STT) → Groq API (LLM) → Web Speech API (TTS) → User hears answer
```

### States

| Orb state | Colour | Meaning |
|---|---|---|
| **Ready** | Neutral / periwinkle glow | Waiting for interaction |
| **Listening** | Blue ring spinning | Capturing microphone input |
| **Thinking** | Grey ring fast-spinning | Waiting for LLM response |
| **Speaking** | Green ring + ripples | Reading the response aloud |

---

## Tech stack

### APIs & Services

| Service | Purpose | Details |
|---|---|---|
| **[Groq API](https://console.groq.com/)** | LLM inference | Model: `llama-3.3-70b-versatile`, max 200 tokens, temperature 0.7 |
| **Web Speech API — SpeechRecognition** | Speech-to-text | Browser-native, no external dependency |
| **Web Speech API — SpeechSynthesis** | Text-to-speech | Browser-native, prefers Google UK/US English voices |
| **Google Fonts** | Typography | Inter (300, 400, 500, 600) |

### Why Groq?

Groq offers extremely fast LLM inference (sub-second response times in most cases), which is critical for a voice interface — any noticeable delay between speaking and hearing an answer breaks the conversational feel. The free tier is sufficient for a portfolio use case.

### Why browser-native Speech APIs?

Zero latency for TTS (no round-trip to an external service), no API key required, and it works offline. The tradeoff is voice quality varies by browser and OS — Chrome on desktop gives the best results.

---

## Architecture

The entire application is `index.html` + one serverless function — no build step, no framework, no bundler.

```
VUI-Portfolio/
├── index.html      ← UI, portfolio data, and conversation logic
└── api/
    └── chat.js     ← Vercel serverless proxy (keeps the API key server-side)
```

### Portfolio data

All content lives in a `portfolioData` JavaScript object inside `index.html`. It has five sections:

| Key | Type | Content |
|---|---|---|
| `about` | String | Full bio: background, travel, teaching, hobbies |
| `services` | Array of strings | 16 services with short descriptions |
| `projects` | Array of objects | Each with `name`, `url`, `role`, `year`, `description` |
| `skills` | Object | Categories (`Web Builders`, `AI Tools`, etc.) mapped to arrays of tools |
| `contact` | Object | Platform names mapped to URLs / email |

At runtime, this entire object is serialised with `JSON.stringify` and injected directly into the system prompt, so the LLM has full access to it on every request.

### System prompt and intent mapping

The system prompt instructs the LLM to classify each user question into one of seven intents and respond accordingly:

| Intent | Covers | Response rule |
|---|---|---|
| `about_me` | Bio, travel, hobbies, teaching | Use the full `about` string |
| `projects` | Client work and case studies | Name + role + year + one-sentence description |
| `services` | The 16 services offered | List max 4, mention there are more |
| `skills` | Tech stack and tools | Pull from the `skills` categories |
| `contact` | How to get in touch | Always include email + LinkedIn |
| `vibecoding` | Vibe Coding page | Reference the dedicated URL |
| `fallback` | Anything else | Friendly redirect |

Global rules enforced via prompt: max ~30 seconds of speech per response (3–4 sentences), be specific with real data rather than generic, always end with a follow-up question to keep the conversation going.

### Conversation history

Every exchange is accumulated in a `conversationHistory[]` array as `{ role, content }` pairs — the standard OpenAI message format. On each request, the full history is sent to the LLM alongside the system prompt, giving it context of everything said so far. This enables natural multi-turn conversations ("tell me more about that project", "what else can you do?") without any server-side session storage.

The history resets either on page refresh or when the trash icon is tapped.

---

## Running locally

The project uses a Vercel serverless function for the API proxy, so Live Server won't work. Use the Vercel CLI instead:

```bash
npm i -g vercel
vercel dev
```

On first run it will ask you to log in and link the project. Then create a `.env.local` file in the root with your Groq key:

```
GROQ_API_KEY=your-groq-api-key-here
```

The app will be available at `http://localhost:3000`.

> **Note:** Chrome and Edge give the best experience. Firefox has limited SpeechRecognition support. Safari may require enabling the Web Speech API in experimental settings.

---

## Configuration

Get a free Groq API key at [console.groq.com](https://console.groq.com/).

- **Local:** add it to `.env.local` (gitignored)
- **Production:** add it as an environment variable in the Vercel dashboard under `GROQ_API_KEY`

The key is never exposed to the client — it lives exclusively in the serverless function.

---

## Deployment

The project is deployed on Vercel. The `api/chat.js` function acts as a proxy between the browser and the Groq API, keeping the key server-side.

```bash
git push origin main   # Vercel auto-deploys on every push to main
```

---

## Browser compatibility

| Browser | STT | TTS | Notes |
|---|---|---|---|
| Chrome (desktop) | ✅ | ✅ | Best experience, best voices |
| Edge (desktop) | ✅ | ✅ | Good |
| Safari (macOS/iOS) | ⚠️ | ✅ | STT requires user permission prompt |
| Firefox | ❌ | ✅ | SpeechRecognition not supported |

---

## Author

**Fernando Comet** — Freelance Creative Technologist  
[fernandocomet.com](https://fernandocomet.com) · [LinkedIn](https://www.linkedin.com/in/fernandocomet/) · [X](https://x.com/fernandocomet)
