import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

export async function detectLanguage(text: string): Promise<string> {
  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      {
        role: 'user',
        content: `Detect the language of this text and return ONLY the language name in English (e.g., Hindi, English, Hinglish, Gujarati, etc.): "${text}"`
      }
    ],
    max_tokens: 20,
  });
  
  return (response.choices && response.choices[0]?.message?.content?.toString()?.trim()) || 'English';
}
