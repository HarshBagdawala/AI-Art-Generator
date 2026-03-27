import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function enhancePrompt(originalPrompt: string, language: string): Promise<string> {
  const systemPrompt = `You are an AI image prompt engineer. Your job is to:
  1. Translate any non-English input (Hindi, Hinglish, Gujarati, etc.) to English
  2. Enhance the prompt with vivid detail, artistic style, lighting, and quality descriptors
  3. Keep the output under 150 words
  CRITICAL: Return ONLY the enhanced prompt text. No labels, no prefixes like 'Enhanced Prompt:', no explanations. Just the raw prompt.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Original prompt (${language}): ${originalPrompt}` }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 300,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || originalPrompt;

  // Strip any prefix the model may add (e.g., "Enhanced Prompt:", "Here is...")
  const cleaned = raw
    .replace(/^(enhanced prompt|prompt|here is.*?:|output)[:\s]*/i, '')
    .replace(/^[\n\r]+/, '')
    .trim();

  return cleaned || originalPrompt;
}

export async function speechToText(audioUrl: string): Promise<{ text: string }> {
  try {
    // Note: Groq Whisper requires a file upload. 
    // Usually, we would download the file first, but since we are in a serverless env,
    // we might need to handle the stream or use a temporary file.
    // For this implementation, we assume the Whisper API can handle the translation 
    // from a buffer or we use the Groq SDK's transcription method.

    // Step 1: Download audio
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();
    const file = new File([audioBlob], 'recording.ogg', { type: 'audio/ogg' });

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
    });

    return { text: transcription.text };
  } catch (error) {
    console.error('Groq STT Error:', error);
    return { text: '' };
  }
}
