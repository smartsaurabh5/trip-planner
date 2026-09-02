import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, days, budget, travelers, interests, language, currency } = body;

    if (!destination || !days) {
      return NextResponse.json(
        { error: 'Destination and number of days are required.' },
        { status: 400 }
      );
    }

    const selectedCurrency = currency || 'INR (₹)';

    const langInstruction = 
      language === 'Hindi' 
        ? 'Generate all descriptive text, summaries, and activity suggestions in pure Hindi (Devanagari script).' 
        : language === 'Hinglish'
        ? 'Generate all descriptive text, summaries, and activity suggestions in casual conversational Hinglish (Hindi written in Roman English script).'
        : 'Generate all content in clear English.';

    const prompt = `
You are an expert AI Travel Guide and Geographer.
Generate a structured, highly detailed trip itinerary with accurate map coordinates for:
- Destination: ${destination}
- Duration: ${days} days
- Budget Level: ${budget || 'Moderate'}
- Number of Travelers: ${travelers || 'Solo / 1 Person'}
- Interests & Preferences: ${interests || 'General sightseeing, local food, culture'}
- Language Requirement: ${langInstruction}
- Preferred Currency: ${selectedCurrency}

Provide accurate latitude and longitude for the destination center and major day stops for map rendering.
Return strictly valid JSON with this exact schema:
{
  "destination": "${destination}",
  "duration": "${days} Days",
  "currency": "${selectedCurrency}",
  "summary": "Short engaging summary of the trip",
  "estimatedCost": "Total approximate budget formatted in ${selectedCurrency}",
  "mapCoordinates": {
    "center": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "spots": [
      {
        "name": "Stop or Landmark Name",
        "day": 1,
        "lat": 28.6129,
        "lng": 77.2295,
        "description": "Brief note on why visiting"
      }
    ]
  },
  "weather": {
    "temperature": "Expected temperature range",
    "condition": "Condition summary",
    "clothingTip": "Specific clothing advice based on climate"
  },
  "safetyAdvisory": {
    "commonScams": ["Scam 1 warning", "Scam 2 warning"],
    "safeTravelTips": ["Tip 1", "Tip 2"],
    "emergencyContact": "Local emergency dial number"
  },
  "budgetBreakdown": {
    "stay": { "percentage": 35, "estimatedAmount": "Cost in ${selectedCurrency}" },
    "food": { "percentage": 25, "estimatedAmount": "Cost in ${selectedCurrency}" },
    "transport": { "percentage": 20, "estimatedAmount": "Cost in ${selectedCurrency}" },
    "activities": { "percentage": 20, "estimatedAmount": "Cost in ${selectedCurrency}" }
  },
  "dailyPlan": [
    {
      "day": 1,
      "theme": "Theme of the day",
      "morning": "Morning activity details with places to see",
      "afternoon": "Afternoon activity and lunch recommendation",
      "evening": "Evening activity and dinner recommendation",
      "tips": "Practical tips or transport suggestions for this day"
    }
  ],
  "packingEssentials": ["Item 1", "Item 2", "Item 3"],
  "importantTips": ["Tip 1", "Tip 2", "Tip 3"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const tripPlan = JSON.parse(response.text);

    return NextResponse.json({ success: true, data: tripPlan });
  } catch (error) {
    console.error('Trip Planning API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary. Please check API key or prompt.' },
      { status: 500 }
    );
  }
}