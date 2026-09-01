# 🌍 AI Travel Planner & Itinerary Generator

An intelligent full-stack travel planning application built with **Next.js (App Router)** and powered by **Google Gemini API (`gemini-3.6-flash`)**. It generates hyper-personalized, day-by-day travel itineraries based on destination, duration, budget tier, traveler count, and interests.

---

## ✨ Key Features

- **Personalized Day-by-Day Planning:** Structured morning, afternoon, and evening breakdowns with local sightseeing and dining spots.
- **Dynamic Budget Estimation:** AI-calculated approximate cost predictions tailored to budget levels (Backpacker, Moderate, Luxury).
- **Packing & Travel Tips:** Context-aware packing essentials and destination-specific travel tips.
- **Export & Share:** 1-click **Save as PDF / Print** layout and **Copy to Clipboard** support.
- **Structured JSON Schema:** Gemini API outputs are strictly enforced in valid JSON for seamless frontend rendering.
- **Modern Responsive UI:** Built with Tailwind CSS and Lucide React icons.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **AI Model / SDK:** Google Gemini API (`@google/genai`, `gemini-3.6-flash`)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Validation & Parsing:** Zod & Native JSON Schemas

---

## 🚀 Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/trip_planner.git
cd trip_planner
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`
> Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the development server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 📂 Project Architecture

\`\`\`text
trip_planner/
├── app/
│   ├── api/
│   │   └── plan-trip/
│   │       └── route.js      # Backend API endpoint invoking Gemini 3.6 Flash
│   ├── layout.js             # Root layout
│   └── page.js               # Frontend Form + Interactive Itinerary View + Print UI
├── lib/
│   └── gemini.js             # Google GenAI client instance
├── .env.local                # Environment configuration (git-ignored)
└── package.json
\`\`\`