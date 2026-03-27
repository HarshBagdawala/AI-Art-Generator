const BASE_URL = 'https://api.11za.in/apis/sendMessage/sendMessages';

function getAuthToken(): string {
  return process.env.ELZA_API_KEY || '';
}

export async function sendWhatsAppText(
  to: string,
  message: string
): Promise<boolean> {
  try {
    const payload = {
      sendto: to,
      authToken: getAuthToken(),
      originWebsite: 'https://11za.com',
      contentType: 'text',
      text: message,
    };

    console.log('📤 Sending text to:', to, '| Length:', message.length);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11za Send Text Failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
      });
      return false;
    }

    try {
      const result = await response.json();
      console.log(`✅ Text sent to ${to}:`, result);
    } catch {
      console.log(`✅ Text sent to ${to} (could not parse response)`);
    }

    return true;
  } catch (err) {
    console.error('11za Send Text Exception:', err);
    return false;
  }
}

export async function sendWhatsAppImage(
  to: string,
  imageUrl: string,
  caption: string
): Promise<boolean> {
  try {
    const payload = {
      sendto: to,
      authToken: getAuthToken(),
      originWebsite: 'https://11za.com',
      contentType: 'image',
      myfile: imageUrl,
      myfilename: 'art.jpg',
      text: caption,
    };

    console.log('📤 Sending image to:', to, '| URL:', imageUrl);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11za Send Image Failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
      });
      return false;
    }

    try {
      const result = await response.json();
      console.log(`✅ Image sent to ${to}:`, result);
    } catch {
      console.log(`✅ Image sent to ${to} (could not parse response)`);
    }

    return true;
  } catch (err) {
    console.error('11za Send Image Exception:', err);
    return false;
  }
}
