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
    model: 'llama-3.1-70b-versatile',
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() || originalPrompt;
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
