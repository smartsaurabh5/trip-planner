import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, dayNumber, currentTheme, budget, interests, language, currency } = body;

    if (!destination || !dayNumber) {
      return NextResponse.json(
        { error: 'Destination and day number are required.' },
        { status: 400 }
      );
    }

    const selectedCurrency = currency || 'INR (₹)';

    const langInstruction = 
      language === 'Hindi' 
        ? 'Generate all content in pure Hindi (Devanagari script).' 
        : language === 'Hinglish'
        ? 'Generate all content in casual conversational Hinglish (Hindi written in Roman English script).'
        : 'Generate all content in clear English.';

    const prompt = `
You are an expert AI Travel Guide.
Generate a fresh, unique, alternative day plan for Day ${dayNumber} of a trip to ${destination}.
Preferences:
- Current/Previous Theme: ${currentTheme || 'Exploration'}
- Budget Level: ${budget || 'Moderate'}
- Preferred Currency: ${selectedCurrency}
- Interests: ${interests || 'Sightseeing, food, culture'}
- Language Requirement: ${langInstruction}

Provide exciting alternative activities different from the previous plan.
Return the response strictly as valid JSON matching this exact structure:
{
  "day": ${dayNumber},
  "theme": "New creative theme for this day",
  "morning": "Morning activity details with places to see",
  "afternoon": "Afternoon activity and lunch recommendation",
  "evening": "Evening activity and dinner recommendation",
  "tips": "Practical tips or transport suggestions for this day"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const newDayPlan = JSON.parse(response.text);

    return NextResponse.json({ success: true, data: newDayPlan });
  } catch (error) {
    console.error('Regenerate Day API Error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate day plan.' },
      { status: 500 }
    );
  }
}