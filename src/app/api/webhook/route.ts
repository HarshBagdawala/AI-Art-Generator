import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage } from '@/lib/mistral';
import { enhancePrompt, speechToText } from '@/lib/groq';
import { generateImage } from '@/lib/pollinations';
import { sendWhatsAppImage, sendWhatsAppText } from '@/lib/elza';
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────
// Main processing function (runs in background)
// ─────────────────────────────────────────────
async function processMessage(from: string, messageText: string) {
  const startTime = Date.now();

  try {
    const command = messageText.toLowerCase().trim();

    // Help Command
    if (command === 'help' || command === '/help') {
      await sendWhatsAppText(
        from,
        `🎨 *ArtBot Help* 🎨\n\nSimply send any text or voice message to generate an AI image!\n\n*Features:*\n• *Multilingual:* Type in Hindi, English, etc.\n• *Negative Prompts:* Add "NO: things you don't want" at the end.\n• *history:* See your last 3 creations`
      );
      return;
    }

    // History Command
    if (command === 'history' || command === '/history') {
      const { data: history, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('phone_number', from)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error || !history || history.length === 0) {
        await sendWhatsAppText(from, "You haven't generated any art yet! Send me a prompt to start. 🎨");
      } else {
        await sendWhatsAppText(from, "📜 *Your Recent Art History:*");
        for (const item of history) {
          await sendWhatsAppImage(from, item.image_url, `🖼️ ${item.original_prompt}`);
        }
      }
      return;
    }

    // Rate Limiting (Max 5 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', from)
      .gt('created_at', oneHourAgo);

    if (count !== null && count >= 5) {
      await sendWhatsAppText(from, "⏳ Rate limit reached. You've generated 5 images this hour. Please wait! 🎨");
      return;
    }

    // Step 1: Acknowledge
    await sendWhatsAppText(from, `🎨 *Generating your art...*\n\nPrompt: "${messageText}"\n\n⏳ Please wait 10-15 seconds...`);

    // Step 2: Parse negative prompts
    let cleanPrompt = messageText;
    let negativePrompt = '';
    if (messageText.toUpperCase().includes('NO:')) {
      const parts = messageText.split(/NO:/i);
      cleanPrompt = parts[0].trim();
      negativePrompt = parts[1].trim();
    }

    // Step 3: Detect language
    const language = await detectLanguage(cleanPrompt);
    console.log(`🌍 Language detected: ${language}`);

    // Step 4: Enhance prompt
    let finalPrompt = cleanPrompt;
    if (negativePrompt) finalPrompt += ` (Avoid: ${negativePrompt})`;
    const enhancedPrompt = await enhancePrompt(finalPrompt, language);
    console.log(`✨ Enhanced prompt: ${enhancedPrompt}`);

    // Step 5: Generate image
    const imageUrl = await generateImage(enhancedPrompt);
    console.log(`🖼️ Image URL: ${imageUrl}`);

    // Step 6: Send image back to user
    const caption = `✅ *Your AI Art is ready!*\n\n🖼️ *Prompt:* ${cleanPrompt}\n\n_Send another prompt to create more!_ 🎨`;
    await sendWhatsAppImage(from, imageUrl, caption);

    // Step 7: Log to Supabase
    const { data: user } = await supabase
      .from('users')
      .upsert({ phone_number: from, last_active: new Date().toISOString() }, { onConflict: 'phone_number' })
      .select('id')
      .single();

    await supabase.from('image_generations').insert({
      user_id: user?.id,
      phone_number: from,
      original_prompt: messageText,
      detected_language: language,
      enhanced_prompt: enhancedPrompt,
      image_url: imageUrl,
      pollinations_url: imageUrl,
      status: 'success',
      processing_time_ms: Date.now() - startTime,
    });

    console.log(`✅ Done for ${from} in ${Date.now() - startTime}ms`);

  } catch (error) {
    console.error('❌ processMessage error:', error);
    try {
      await sendWhatsAppText(from, '❌ Something went wrong. Please try again!');
    } catch { /* ignore */ }
  }
}

// ─────────────────────────────────────────────
// Webhook Handler — Returns immediately to 11za
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('📥 Webhook received:', JSON.stringify(payload).substring(0, 300));

    // Log to Supabase (fire-and-forget)
    supabase.from('whatsapp_messages').insert([{
      from_number: payload.from,
      content_type: payload.content?.contentType,
      content_text: payload.content?.text || null,
      event_type: payload.event || 'MoMessage',
      raw_payload: payload,
    }]).then(() => {}).catch(console.error);

    // Extract phone number and message text
    const from: string = payload.from;
    const contentType: string = payload.content?.contentType || '';
    let messageText: string | null = null;

    if (contentType === 'text') {
      messageText = payload.content?.text?.trim() || null;
    } else if (contentType === 'audio' || contentType === 'voice') {
      const mediaUrl = payload.content?.media?.url || payload.content?.url || null;
      if (mediaUrl) {
        console.log('🎤 Voice message, starting STT...');
        const stt = await speechToText(mediaUrl);
        messageText = stt?.text?.trim() || null;
        console.log('📝 Transcription:', messageText);
      }
    }

    if (!from || !messageText) {
      return NextResponse.json({ ok: true });
    }

    // Process in background (don't await — return fast to 11za)
    processMessage(from, messageText).catch(console.error);

    // Immediately return OK to prevent 11za timeout
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook parse error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to 11za
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ArtBot Webhook Active ✅' });
}
