import { getGeminiClient } from './gemini.js';

/**
 * Robust Multi-Layer AI Generation Helper
 * Layer 1: Groq API (Ultra-fast, ~500ms response)
 * Layer 2: OpenRouter API (High capacity, versatile fallback)
 * Layer 3: Google Gemini API (Backup provider)
 */

export async function generateStructuredJSON(prompt) {
  const errors = [];

  // --- LAYER 1: GROQ API (Primary - Ultra Fast) ---
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqModels = ['openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'groq/compound-mini'];
    for (const model of groqModels) {
      try {
        console.log(`[AI-Provider] Trying Layer 1 (Groq - ${model})...`);
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
                content: 'You are an expert AI Travel Guide. Return ONLY strictly valid raw JSON. Do not include markdown code blocks, backticks, or extra prose outside the JSON object.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.6
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = parseJSONContent(content);
            if (parsed) {
              console.log(`[AI-Provider] ✅ Layer 1 (Groq - ${model}) Succeeded in ${Date.now() - startTime}ms`);
              return parsed;
            }
          }
        } else {
          const errBody = await response.text();
          console.warn(`[AI-Provider] Layer 1 (Groq - ${model}) HTTP ${response.status}:`, errBody);
          errors.push(`Groq (${model}): HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`[AI-Provider] Layer 1 (Groq - ${model}) Error:`, err.message);
        errors.push(`Groq (${model}): ${err.message}`);
      }
    }
  }

  // --- LAYER 2: OPENROUTER API (Secondary - Fallback 1) ---
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const openRouterModels = ['meta-llama/llama-3.3-70b-instruct', 'deepseek/deepseek-chat'];
    for (const model of openRouterModels) {
      try {
        console.log(`[AI-Provider] Trying Layer 2 (OpenRouter - ${model})...`);
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
                content: 'You are an expert AI Travel Guide. Return ONLY strictly valid raw JSON. Do not include markdown code blocks, backticks, or extra prose outside the JSON object.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.6
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = parseJSONContent(content);
            if (parsed) {
              console.log(`[AI-Provider] ✅ Layer 2 (OpenRouter - ${model}) Succeeded in ${Date.now() - startTime}ms`);
              return parsed;
            }
          }
        } else {
          const errBody = await response.text();
          console.warn(`[AI-Provider] Layer 2 (OpenRouter - ${model}) HTTP ${response.status}:`, errBody);
          errors.push(`OpenRouter (${model}): HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`[AI-Provider] Layer 2 (OpenRouter - ${model}) Error:`, err.message);
        errors.push(`OpenRouter (${model}): ${err.message}`);
      }
    }
  }

  // --- LAYER 3: GOOGLE GEMINI API (Tertiary - Fallback 2) ---
  const geminiClient = getGeminiClient();
  if (geminiClient) {
    try {
      console.log('[AI-Provider] Trying Layer 3 (Google Gemini)...');
      const startTime = Date.now();
      const response = await geminiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const parsed = parseJSONContent(response.text);
        if (parsed) {
          console.log(`[AI-Provider] ✅ Layer 3 (Google Gemini) Succeeded in ${Date.now() - startTime}ms`);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[AI-Provider] Layer 3 (Google Gemini) Error:', err.message);
      errors.push(`Gemini: ${err.message}`);
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
