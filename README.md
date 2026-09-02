# 🌍 AI Travel Planner & Itinerary Generator

An intelligent full-stack travel planning application built with **Next.js (App Router)** and powered by **Google Gemini API (`gemini-3.6-flash`)**. It generates hyper-personalized, weather-synced travel itineraries with interactive route maps, multi-currency budget breakdowns, scam warnings, and offline multi-trip caching.

---

## ✨ Key Features

- **Personalized Day-by-Day Planning:** Detailed morning, afternoon, and evening breakdowns with local dining spots and transportation tips.
- **Interactive Route Map:** In-app visual map powered by **Leaflet & OpenStreetMap** with custom markers showing destination spots and daily stops.
- **Interactive Packing Checklist:** Dynamic checklist with live progress tracking bar and custom item addition support.
- **Multi-Currency Budget Projections:** Real-time localized cost estimation supporting **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **AED (د.إ)**, and **JPY (¥)**.
- **Dynamic Expense Breakdown:** Visual percentage and cost estimation cards for Stay, Food, Transport, and Activities.
- **Weather Advisory & Climate Sync:** AI-generated temperature forecasts, climate summaries, and contextual clothing suggestions.
- **Local Safety & Scam Alerts:** Warnings on common tourist traps, destination-specific scams, and local emergency helpline numbers.
- **Single-Day Regeneration:** Granular AI regeneration to swap or customize individual days without re-generating the entire trip.
- **Offline History Drawer:** LocalStorage-backed caching to save, switch, and manage previous trip itineraries with zero API overhead.
- **Direct Google Maps Navigation:** Quick 1-click external navigation links for every spot.
- **Multi-Language Engine:** Full support for **English**, **Hindi (हिंदी)**, and conversational **Hinglish**.
- **Export & Share:** Print-ready PDF styling and 1-click clipboard export.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **AI Model / SDK:** Google Gemini API (`@google/genai`, `gemini-3.6-flash`)
- **Maps:** Leaflet & React-Leaflet (OpenStreetMap)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Storage:** Browser `localStorage` Cache API

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
Create a `.env.local` file in the root directory:

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
│   │   │   └── route.js        # Full trip generation with geo-coordinates
│   │   └── regenerate-day/
│   │       └── route.js        # Single-day customization endpoint
│   ├── layout.js               # Root layout
│   └── page.js                 # Interactive UI (Form, Drawer, Checklist, Print)
├── components/
│   └── RouteMap.js             # Client-side interactive Leaflet map component
├── lib/
│   └── gemini.js               # Google GenAI client instance
├── .env.local                  # Environment configuration (git-ignored)
└── package.json
```