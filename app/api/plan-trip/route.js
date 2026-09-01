import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, days, budget, travelers, interests, language } = body;

    if (!destination || !days) {
      return NextResponse.json(
        { error: 'Destination and number of days are required.' },
        { status: 400 }
      );
    }

    const langInstruction = 
      language === 'Hindi' 
        ? 'Generate all descriptive text, summaries, and activity suggestions in pure Hindi (Devanagari script).' 
        : language === 'Hinglish'
        ? 'Generate all descriptive text, summaries, and activity suggestions in casual conversational Hinglish (Hindi written in Roman English script, e.g., "Subah 9 baje Manali Mall Road ghumne niklein...").'
        : 'Generate all content in clear English.';

    const prompt = `
You are an expert AI Travel Guide.
Generate a structured, highly detailed, realistic trip itinerary based on the following preferences:
- Destination: ${destination}
- Duration: ${days} days
- Budget Level: ${budget || 'Moderate'}
- Number of Travelers: ${travelers || 'Solo / 1 Person'}
- Interests & Preferences: ${interests || 'General sightseeing, local food, culture'}
- Language Requirement: ${langInstruction}

Return the response strictly as valid JSON with this exact structure:
{
  "destination": "${destination}",
  "duration": "${days} Days",
  "summary": "Short engaging summary of the trip",
  "estimatedCost": "Total approximate budget string (e.g. ₹15,000 - ₹20,000)",
  "budgetBreakdown": {
    "stay": { "percentage": 35, "estimatedAmount": "Estimated cost for hotels/stays" },
    "food": { "percentage": 25, "estimatedAmount": "Estimated cost for dining/street food" },
    "transport": { "percentage": 20, "estimatedAmount": "Estimated cost for local travel/cabs" },
    "activities": { "percentage": 20, "estimatedAmount": "Estimated cost for entry tickets/experiences" }
  },
  "dailyPlan": [
    {
      "day": 1,
      "theme": "Theme of the day (e.g. Arrival & Old Town Exploration)",
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