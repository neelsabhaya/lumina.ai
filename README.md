# 🔮 Lumina.ai — The AI Prompt Architect

**Lumina.ai** is a professional prompt engineering platform designed to help users "architect" production-ready AI prompts. By leveraging **Llama 3.3-70B**, the platform provides real-time quality grading and iterative feedback to bridge the gap between vague intent and engineering-grade prompts.

---

## 🚀 Key Features

* **⚡ Real-time Grading**: Instant quality scoring (0-100) and context analysis using the **Groq SDK**.
* **📊 Confidence Radar**: A dynamic UI visualization that tracks prompt maturity based on structural constraints and technical detail.
* **🛡️ Secure Proxy Layer**: Implements the latest **Next.js 16 proxy.ts** convention to protect AI API routes via **Supabase SSR**.
* **🧠 Context-Aware Feedback**: An AI architect that asks specific questions to refine missing context before generating final outputs.

---

## 🛠️ Tech Stack

| Component | Technology |
| --- | --- |
| **Framework** | **Next.js 16** (App Router & Turbopack) |
| **Authentication** | **Supabase Auth** with Server-Side Rendering (SSR) |
| **AI Engine** | **Groq Cloud** (Llama-3.3-70b-versatile) |
| **Styling** | **Tailwind CSS** with Dark Mode support |
| **Language** | **TypeScript** (Strictly typed interfaces) |

---

## 🚦 Getting Started

### 1. Prerequisites

* Node.js 18.17 or later
* A Groq API Key
* A Supabase Project (URL and Anon Key)

### 2. Installation

```bash
git clone https://github.com/neelsabhaya/lumina.ai.git
cd lumina.ai
npm install

```

### 3. Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key

```

### 4. Run Development Server

```bash
npm run dev

```

---

## 🏗️ Architecture Insight: The Proxy Pattern

To ensure security and prevent unauthorized API usage, Lumina.ai utilizes a custom **Proxy Middleware**:

* **Authentication**: All requests to `/api/grade` are intercepted by `src/proxy.ts`.
* **Session Validation**: The proxy uses `supabase.auth.getUser()` to verify the user's JWT server-side before allowing the AI request to proceed.
* **State Management**: Chat history is strictly typed via a `HistoryItem` interface to maintain context without data leakage.

---

## 👨‍💻 Developer

**Neel Sabhaya** *Full Stack Developer & Sheridan College Graduate*

* **Portfolio**: [neelsabhaya.com](https://neelsabhaya.github.io/)
* **Experience**: Software Engineer at Aayog Infotech
