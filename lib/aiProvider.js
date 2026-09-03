import { getGeminiClient } from './gemini.js';

/**
 * Optimized Multi-Layer AI Generation Engine
 * Layer 1: Google Gemini API (Primary - Deeply detailed, local shop/food names, 2.5s fast timeout)
 * Layer 2: Groq API (Secondary - Sub-second ultra fast fallback)
 * Layer 3: OpenRouter API (Tertiary - High capacity fallback)
 */

export async function generateStructuredJSON(userPrompt) {
  const errors = [];

  // Enhanced System Prompt to enforce rich, detailed itineraries with authentic local shop & dhaba names
  const enhancedPrompt = `${userPrompt}

IMPORTANT QUALITY REQUIREMENTS:
- Include famous local shop names, legendary dhabas, street food stalls, markets, and exact local landmarks in morning, afternoon, and evening plans (e.g. "Lassiwala at MI Road", "Chokhi Dhani", "Pundit Kulfi", "Bapu Bazaar").
- Make the summary and daily plans highly engaging, informative, and detailed. Do NOT return superficial or generic placeholders.
- Return ONLY strictly valid raw JSON with NO markdown code fences or backticks.`;

  // --- LAYER 1: GOOGLE GEMINI API (Primary for Max Detail & Quality - 2.5s Timeout) ---
  const geminiClient = getGeminiClient();
  if (geminiClient) {
    try {
      console.log('[AI-Provider] Trying Layer 1 (Google Gemini - 2.5s Fast Timeout)...');
      const startTime = Date.now();

      // 2.5 Second Timeout Guard for instant fallback
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API response time >2500ms')), 2500)
      );

      const geminiApiPromise = (async () => {
        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: enhancedPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) {
          return parseJSONContent(response.text);
        }
        return null;
      })();

      const parsed = await Promise.race([geminiApiPromise, timeoutPromise]);
      if (parsed) {
        console.log(`[AI-Provider] ✅ Layer 1 (Google Gemini) Succeeded in ${Date.now() - startTime}ms`);
        return parsed;
      }
    } catch (err) {
      console.warn(`[AI-Provider] Layer 1 (Google Gemini) Skipped/Timed Out (${err.message}). Instant Switch to Layer 2 (Groq)...`);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  // --- LAYER 2: GROQ API (Secondary - Ultra-Fast Fallback ~500ms) ---
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqModels = ['openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'groq/compound-mini'];
    for (const model of groqModels) {
      try {
        console.log(`[AI-Provider] Trying Layer 2 (Groq - ${model})...`);
        const startTime = Date.now();
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are an expert AI Travel Guide. Include famous local shop names, dhabas, street food, and landmarks. Return ONLY strictly valid raw JSON with no markdown.'
              },
              { role: 'user', content: enhancedPrompt }
            ],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = parseJSONContent(content);
            if (parsed) {
              console.log(`[AI-Provider] ✅ Layer 2 (Groq - ${model}) Succeeded in ${Date.now() - startTime}ms`);
              return parsed;
            }
          }
        } else {
          const errBody = await response.text();
          console.warn(`[AI-Provider] Layer 2 (Groq - ${model}) HTTP ${response.status}:`, errBody);
          errors.push(`Groq (${model}): HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`[AI-Provider] Layer 2 (Groq - ${model}) Error:`, err.message);
        errors.push(`Groq (${model}): ${err.message}`);
      }
    }
  }

  // --- LAYER 3: OPENROUTER API (Tertiary - Fallback 2) ---
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const openRouterModels = ['meta-llama/llama-3.3-70b-instruct', 'deepseek/deepseek-chat'];
    for (const model of openRouterModels) {
      try {
        console.log(`[AI-Provider] Trying Layer 3 (OpenRouter - ${model})...`);
        const startTime = Date.now();
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ghumakkad-saathi.onrender.com',
            'X-Title': 'Ghumakkad Saathi'
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are an expert AI Travel Guide. Include famous local shop names, dhabas, street food, and landmarks. Return ONLY strictly valid raw JSON with no markdown.'
              },
              { role: 'user', content: enhancedPrompt }
            ],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = parseJSONContent(content);
            if (parsed) {
              console.log(`[AI-Provider] ✅ Layer 3 (OpenRouter - ${model}) Succeeded in ${Date.now() - startTime}ms`);
              return parsed;
            }
          }
        } else {
          const errBody = await response.text();
          console.warn(`[AI-Provider] Layer 3 (OpenRouter - ${model}) HTTP ${response.status}:`, errBody);
          errors.push(`OpenRouter (${model}): HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`[AI-Provider] Layer 3 (OpenRouter - ${model}) Error:`, err.message);
        errors.push(`OpenRouter (${model}): ${err.message}`);
      }
    }
  }

  throw new Error(`All AI Providers failed: ${errors.join(' | ')}`);
}

/**
 * Safely parse JSON from raw string, stripping potential markdown blocks
 */
function parseJSONContent(rawText) {
  if (!rawText) return null;
  try {
    // 1. Direct JSON Parse
    return JSON.parse(rawText);
  } catch (e1) {
    try {
      // 2. Strip ```json ... ``` code fence
      const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (e2) {
      try {
        // 3. Regex extract first {...} block
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (e3) {
        console.error('[AI-Provider] JSON Parsing Failed. Raw Content snippet:', rawText.substring(0, 200));
        return null;
      }
    }
  }
  return null;
}
