import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { detectLanguage } from '@/lib/mistral';
import { enhancePrompt, speechToText } from '@/lib/groq';
import { generateImageStability } from '@/lib/stability';
import { sendWhatsAppImage, sendWhatsAppText } from '@/lib/elza';
import { supabase } from '@/lib/supabase';

// ============================================================
// BACKGROUND PROCESSING — runs after we return 200 to 11za
// ============================================================
async function processMessage(payload: Record<string, unknown>) {
  const startTime = Date.now();

  try {
    // 1️⃣ Log the raw message
    const content = payload.content as Record<string, unknown> | undefined;
    const whatsappInfo = payload.whatsapp as Record<string, unknown> | undefined;

    await supabase.from('whatsapp_messages').insert([{
      message_id: payload.messageId,
      channel: payload.channel,
      from_number: payload.from,
      to_number: payload.to,
      received_at: payload.receivedAt,
      content_type: content?.contentType,
      content_text: content?.text || null,
      sender_name: whatsappInfo?.senderName || null,
      event_type: payload.event,
      raw_payload: payload,
    }]);

    // 2️⃣ Only handle incoming user messages
    if (payload.event !== 'MoMessage') return;

    // 3️⃣ Extract text or transcribe voice
    let messageText: string | null = null;

    if (content?.contentType === 'text') {
      messageText = (content.text as string)?.trim() || null;
    }

    if (content?.contentType === 'media') {
      const media = content.media as Record<string, unknown> | undefined;
      const mediaUrl = media?.url as string | null;

      if (media?.type === 'voice' || media?.type === 'audio') {
        console.log('🎤 Voice message detected, starting STT...');
        if (mediaUrl) {
          const stt = await speechToText(mediaUrl);
          messageText = stt?.text?.trim() || null;
          console.log('📝 Transcription:', messageText);
        }
      }
    }

    const phoneNumber = payload.from as string;
    const senderName = (whatsappInfo?.senderName as string) || 'User';

    if (!phoneNumber || !messageText) return;

    const command = messageText.toLowerCase().trim();

    // ── HELP command ──────────────────────────────────────────
    if (command === 'help' || command === '/help') {
      await sendWhatsAppText(phoneNumber,
        `🎨 *ArtBot Help* 🎨\n\nSend any text or voice message to generate an AI image!\n\n*Features:*\n• *Multilingual:* Hindi, English, Hinglish, etc.\n• *Negative Prompts:* Add "NO: things you don't want"\n• *history:* See your last 3 creations`
      );
      return;
    }

    // ── HISTORY command ───────────────────────────────────────
    if (command === 'history' || command === '/history') {
      const { data: history } = await supabase
        .from('image_generations')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!history || history.length === 0) {
        await sendWhatsAppText(phoneNumber, "You haven't generated any art yet! Send me a prompt to start. 🎨");
      } else {
        await sendWhatsAppText(phoneNumber, '📜 *Your Recent Art History:*');
        for (const item of history) {
          await sendWhatsAppImage(phoneNumber, item.image_url, `🖼️ ${item.original_prompt}`);
        }
      }
      return;
    }

    // ── RATE LIMIT ────────────────────────────────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', phoneNumber)
      .gt('created_at', oneHourAgo);

    if (count !== null && count >= 5) {
      await sendWhatsAppText(phoneNumber, '⏳ *Rate Limit Reached*\n\nYou\'ve generated 5 images this hour. Please wait! 🎨');
      return;
    }

    // ── SEND ACK ──────────────────────────────────────────────
    await sendWhatsAppText(phoneNumber, `🎨 *Generating your art...*\n\nPrompt: "${messageText}"\n\n⏳ Please wait 10-15 seconds...`);

    // ── NEGATIVE PROMPT ───────────────────────────────────────
    let cleanPrompt = messageText;
    let negativePrompt = '';
    if (messageText.toUpperCase().includes('NO:')) {
      const parts = messageText.split(/NO:/i);
      cleanPrompt = parts[0].trim();
      negativePrompt = parts[1].trim();
    }

    // ── AI PIPELINE ───────────────────────────────────────────
    const language = await detectLanguage(cleanPrompt);
    let finalPrompt = cleanPrompt;
    if (negativePrompt) finalPrompt += ` (Avoid: ${negativePrompt})`;

    const enhancedPrompt = await enhancePrompt(finalPrompt, language);
    
    // 6️⃣ Generate image with Stability AI
    const imageBuffer = await generateImageStability(enhancedPrompt);

    // 7️⃣ Upload to Supabase Storage
    const fileName = `art_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const bucketName = 'generated-images';

    // Ensure bucket exists (best effort)
    try {
      await supabase.storage.createBucket(bucketName, { public: true });
    } catch (e) {
      // Bucket might already exist
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Supabase Upload Error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const imageUrl = publicUrl;

    // ── SEND IMAGE ────────────────────────────────────────────
    const caption = `✅ *Your AI Art is ready!*\n\n🖼️ *Prompt:* ${cleanPrompt}\n✨ *Enhanced:* ${enhancedPrompt.substring(0, 100)}...\n\n_Send another prompt or voice message!_ 🎨`;
    await sendWhatsAppImage(phoneNumber, imageUrl, caption);

    // ── SAVE TO SUPABASE ──────────────────────────────────────
    const { data: user } = await supabase
      .from('users')
      .upsert(
        { phone_number: phoneNumber, name: senderName, last_active: new Date().toISOString() },
        { onConflict: 'phone_number' }
      )
      .select('id')
      .single();

    await supabase.from('image_generations').insert({
      user_id: user?.id,
      phone_number: phoneNumber,
      original_prompt: messageText,
      detected_language: language,
      enhanced_prompt: enhancedPrompt,
      image_url: imageUrl,
      stability_url: imageUrl,
      status: 'success',
      processing_time_ms: Date.now() - startTime,
    });

    // Update user count
    const { data: existingUser } = await supabase
      .from('users').select('total_images_generated').eq('phone_number', phoneNumber).single();
    if (existingUser) {
      await supabase.from('users')
        .update({ total_images_generated: existingUser.total_images_generated + 1 })
        .eq('phone_number', phoneNumber);
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyStat } = await supabase.from('daily_stats').select('*').eq('date', today).single();
    if (dailyStat) {
      await supabase.from('daily_stats').update({
        total_requests: dailyStat.total_requests + 1,
        successful_generations: dailyStat.successful_generations + 1
      }).eq('date', today);
    } else {
      await supabase.from('daily_stats').insert({ date: today, total_requests: 1, successful_generations: 1, failed_generations: 0, unique_users: 1 });
    }

  } catch (error) {
    console.error('❌ processMessage error:', error);
  }
}

// ============================================================
// WEBHOOK HANDLER — returns immediately to avoid 11za timeout
// ============================================================
export async function POST(req: NextRequest) {
  const payload = await req.json();
  console.log('📩 Webhook received:', JSON.stringify(payload).substring(0, 200));

  // waitUntil keeps the Vercel function alive until processMessage finishes,
  // while still returning the 200 response to 11za immediately
  waitUntil(processMessage(payload));

  // Return immediately so 11za doesn't timeout
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ArtBot Webhook ✅ Active' });
}
