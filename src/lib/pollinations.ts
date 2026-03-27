export async function generateImage(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const width = 1024;
  const height = 1024;
  const model = 'flux'; // flux is best quality on pollinations
  const seed = Math.floor(Math.random() * 1000000);
  
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;
  
  // Return the URL directly. Pollinations is deterministic.
  // We remove the HEAD check to avoid timeouts or blocks from the API.
  return imageUrl;
}
