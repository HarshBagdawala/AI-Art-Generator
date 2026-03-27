const ELZA_BASE_URL = 'https://api.11za.in/apis/sendMessage/sendMessages';

export async function sendWhatsAppImage(
  phoneNumber: string,
  imageUrl: string,
  caption: string
): Promise<boolean> {
  try {
    const response = await fetch(`${ELZA_BASE_URL}`, {
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
        myfilename: "art.jpg",
        text: caption
      }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('11za Send Image Failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error('11za Send Image Exception:', err);
    return false;
  }
}

export async function sendWhatsAppText(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(`${ELZA_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sendto: phoneNumber,
        authToken: process.env.ELZA_API_KEY,
        originWebsite: "https://11za.com",
        contentType: "text",
        text: message
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11za Send Text Failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error('11za Send Text Exception:', err);
    return false;
  }
}
