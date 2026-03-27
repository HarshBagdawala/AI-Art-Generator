const ELZA_BASE_URL = 'https://api.11za.in/apis/sendMessage/sendMessages';

export async function sendWhatsAppImage(
  phoneNumber: string,
  imageUrl: string,
  caption: string
): Promise<boolean> {
  try {
    const response = await fetch(`${ELZA_BASE_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sendto: phoneNumber,
        authToken: process.env.ELZA_API_KEY,
        originWebsite: "https://11za.com",
        contentType: "image",
        myfile: imageUrl,
        caption: caption
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('11za Send Image Error:', err);
    return false;
  }
}

export async function sendWhatsAppText(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(`${ELZA_BASE_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ELZA_API_KEY}`,
        'Instance-Id': process.env.ELEVEN_ZA_PHONE_NUMBER_ID || '',
      },
      body: JSON.stringify({
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('11za Send Text Error:', err);
    return false;
  }
}
