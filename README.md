# 🌍 AI Travel Planner & Itinerary Generator

An intelligent full-stack travel planning application built with **Next.js (App Router)** and powered by **Google Gemini API (`gemini-3.6-flash`)**. It generates hyper-personalized, day-by-day travel itineraries based on destination, duration, budget tier, traveler count, language preferences, and interests.

---

## ✨ Key Features

- **Personalized Day-by-Day Planning:** Structured morning, afternoon, and evening breakdowns with local sightseeing and dining spots.
- **Dynamic Budget Breakdown Visualizer:** Category-wise percentage & cost estimation cards for Stay, Food, Transport, and Activities.
- **Single-Day Regeneration:** Granular AI regeneration to swap or customize individual days without re-generating the entire trip.
- **Direct Google Maps Integration:** Quick 1-click links to search and navigate every recommended spot in Google Maps.
- **Multi-Language Support:** Generate itineraries in **English**, **Hindi (हिंदी)**, or casual conversational **Hinglish**.
- **Packing & Travel Tips:** Context-aware packing essentials and destination-specific travel tips.
- **Export & Share:** 1-click **Save as PDF / Print** layout and **Copy to Clipboard** support.
- **Structured JSON Schema:** Gemini API outputs are strictly enforced in valid JSON for seamless frontend rendering.
- **Modern Responsive UI:** Built with Next.js App Router, Tailwind CSS, and Lucide React icons.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **AI Model / SDK:** Google Gemini API (`@google/genai`, `gemini-3.6-flash`)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Validation & Parsing:** Zod & Native JSON Schemas

---

## 🚀 Getting Started

### 1. Setup and Run Project
Run the following commands in your terminal:

```bash
# Clone the repository
git clone [https://github.com/your-username/trip_planner.git](https://github.com/your-username/trip_planner.git)

# Navigate into the project folder
cd trip_planner

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 2. Setup Environment Variables
Create a `.env.local` file in the root directory and add your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).  
> Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Architecture

```text
trip_planner/
├── app/
│   ├── api/
│   │   ├── plan-trip/
│   │   │   └── route.js        # Full trip generation endpoint (Gemini 3.6 Flash)
│   │   └── regenerate-day/
│   │       └── route.js        # Single-day customization endpoint
│   ├── layout.js               # Root layout
│   └── page.js                 # Complete interactive UI (Form, Maps, Visualizer, Print)
├── lib/
│   └── gemini.js               # Google GenAI client instance
├── .env.local                  # Environment configuration (git-ignored)
└── package.json
```