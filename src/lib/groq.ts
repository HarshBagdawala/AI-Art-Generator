import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function enhancePrompt(originalPrompt: string, language: string): Promise<string> {
  const systemPrompt = `You are an expert AI image prompt engineer. 
  Your job is to:
  1. If the input is in Hindi/Hinglish/any non-English language, translate it to English first
  2. Enhance the prompt to be more detailed, vivid, and suitable for AI image generation
  3. Add artistic style, lighting, quality descriptors
  4. Keep it under 200 words
  5. Return ONLY the enhanced English prompt, nothing else`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Original prompt (${language}): ${originalPrompt}` }
    ],
    model: 'llama3-70b-8192',
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() || originalPrompt;
}
