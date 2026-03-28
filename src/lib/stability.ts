import axios from "axios";
import FormData from "form-data";

export async function generateImageStability(prompt: string): Promise<Buffer> {
  const payload = {
    prompt: prompt,
    output_format: "png"
  };

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/generate/ultra`,
    axios.toFormData(payload, new FormData()),
    {
      validateStatus: undefined,
      responseType: "arraybuffer",
      headers: { 
        Authorization: `Bearer ${process.env.STABILITY_API_KEY || ''}`, 
        Accept: "image/*" 
      },
    },
  );

  if (response.status === 200) {
    return Buffer.from(response.data);
  } else {
    // Attempt to parse error message if available
    let errorMessage = `Stability AI Error ${response.status}`;
    try {
      const errorJson = JSON.parse(Buffer.from(response.data).toString());
      if (errorJson.errors) {
        errorMessage += `: ${errorJson.errors.join(', ')}`;
      } else if (errorJson.message) {
        errorMessage += `: ${errorJson.message}`;
      }
    } catch (e) {
      // Fallback if not JSON
      errorMessage += `: ${Buffer.from(response.data).toString().substring(0, 100)}`;
    }
    throw new Error(errorMessage);
  }
}
