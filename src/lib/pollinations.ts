export async function generateImage(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const width = 1024;
  const height = 1024;
  const model = 'flux'; // flux is best quality on pollinations
  const seed = Math.floor(Math.random() * 1000000);
  
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;
  
  // Verify image is accessible
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (!response.ok) throw new Error('Image generation failed');
    return imageUrl;
  } catch (err) {
    console.error('Pollinations API error:', err);
    throw new Error('Image generation failed');
  }
}
