# 🚗 घुम्मकड़ साथी (Ghumakkad Saathi) — AI Travel Planner & Roadtrip Companion

# Ghumakkad  sathi is live at : https://ghumakkad-saathi.onrender.com

An intelligent full-stack Indian travel planning application built with **Next.js 16 (App Router)**, **Tailwind CSS**, and powered by **Google Gemini AI (`gemini-3.6-flash`)**. It generates hyper-personalized, weather-synced travel itineraries with interactive route maps, target budget allocation, real-time live visitor tracking, ambient roadtrip audio, and custom manual trip inputs.

---

## ✨ Key Features

- **🎨 Immersive Wallpaper UI & Clear Aesthetics:** Stunning full-screen HD roadtrip wallpaper background with ambient UI panels and instant Lightbox artwork preview.
- **🎵 Ambient Roadtrip Music Player:** Built-in floating audio player playing relaxing roadtrip lofi tracks (*"Raah Mein Unse Mulaqat"* vibe).
- **🟢 Real-Time Live Online Visitors:** Serverless active visitor tracking engine via `/api/presence` with real-time session heartbeats and unload beacons.
- **📅 Custom Manual Dropdown Options:** Flexible dropdowns for **Days**, **Budget / Target Money**, and **Group Members** with **`✏️ Custom...`** mode allowing users to type exact custom amounts (e.g., 10 days, ₹15,000, 6 members).
- **🗺️ Zero-Reload Interactive Route Map:** In-app Leaflet & OpenStreetMap interactive route map with custom destination markers and crash-proof `_leaflet_pos` protection that stays 100% stable during navigation and spot clicks.
- **🌧️ Quick Vibe Pills:** 1-click preset trip triggers (*"🌧️ Baarish Roadtrip?"*, *"🚗 Highway Dhaba Guide"*, *"📍 Heritage Route"*).
- **🎯 Tailored Interests & Special Activities:** Custom interests engine supporting photography, cafes, roadside dhabas, heritage forts, trekking, and shopping.
- **💰 Estimated Expense Breakdown:** Visual budget allocation cards for Stay & Hotels, Dhaba & Food, Transport, and Activities & Tickets.
- **🌤️ Weather & Clothing Guide:** AI-generated temperature forecasts, weather conditions, and contextual clothing suggestions.
- **🛡️ Safety & Tourist Advisory:** Destination-specific scam warnings, local safety rules, and local emergency helpline numbers.
- **🔄 Single-Day Regeneration:** Granular AI regeneration to swap or customize individual days without re-generating the entire trip.
- **📜 Saved Trips Drawer:** LocalStorage-backed caching to save, view, switch, and delete previous itineraries.
- **🗣️ Multi-Language Engine:** Full support for **English**, **Hindi (हिंदी)**, and conversational **Hinglish**.
- **🖨️ PDF & Copy Export:** Print-ready PDF styling and 1-click clipboard export.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **AI Model / SDK:** Google Gemini API (`@google/genai`, `gemini-3.6-flash`)
- **Maps:** Leaflet & React-Leaflet (OpenStreetMap)
- **Styling:** Tailwind CSS (Vanilla CSS & Glassmorphism)
- **Icons:** Lucide React
- **Real-Time Presence:** Custom Heartbeat API (`/api/presence`)
- **Storage:** Browser `localStorage` & `sessionStorage`

---

## 🚀 Getting Started

### 1. Setup and Run Project
Run the following commands in your terminal:

```bash
# Clone the repository
git clone https://github.com/your-username/trip_planner.git

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
│   │   │   └── route.js        # AI itinerary generation with custom budget & member bounds
│   │   ├── presence/
│   │   │   └── route.js        # Real-time live online visitor tracking endpoint
│   │   └── regenerate-day/
│   │       └── route.js        # Single-day customization endpoint
│   ├── layout.js               # Root layout
│   └── page.js                 # Interactive UI (Form, Audio Player, Header, Modals, Drawer)
├── components/
│   └── RouteMap.js             # Client-side interactive Leaflet map component (Crash-proof)
├── lib/
│   └── gemini.js               # Google GenAI client instance
├── public/
│   └── ghumakkad-saathi.jpg    # Full-screen wallpaper artwork
├── .env.local                  # Environment configuration (git-ignored)
└── package.json
```