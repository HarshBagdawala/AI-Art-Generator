import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage } from '@/lib/mistral';
import { enhancePrompt, speechToText } from '@/lib/groq';
import { generateImage } from '@/lib/pollinations';
import { sendWhatsAppImage, sendWhatsAppText } from '@/lib/elza';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const payload = await req.json();
    
    // 1️⃣ LOG ALL INCOMING WEBHOOKS TO SUPABASE
    await supabase.from("whatsapp_messages").insert([
      {
        message_id: payload.messageId,
        channel: payload.channel,
        from_number: payload.from,
        to_number: payload.to,
        received_at: payload.receivedAt,
        content_type: payload.content?.contentType,
        content_text: payload.content?.text || null,
        sender_name: payload.whatsapp?.senderName || null,
        event_type: payload.event,
        raw_payload: payload,
      },
    ]);
 
    // Handle only Mobile Originated Messages (MoMessage)
    if (payload.event !== "MoMessage") {
      return NextResponse.json({ success: true });
    }
 
    /* --------------------------------------------------
     * 2️⃣ NORMALIZE MESSAGE (Handle Text & Voice)
     * -------------------------------------------------- */
    let messageText: string | null = null;
    let mediaUrl: string | null = null;
 
    if (payload.content?.contentType === "text") {
      messageText = payload.content.text?.trim() || null;
    }
 
    if (payload.content?.contentType === "media") {
      mediaUrl = payload.content.media?.url || null;
 
      // Handle Voice Messages
      if (
        payload.content.media?.type === "voice" ||
        payload.content.media?.type === "audio"
      ) {
        console.log("🎤 Voice message detected, starting STT...");
        if (mediaUrl) {
          const stt = await speechToText(mediaUrl);
          messageText = stt?.text?.trim() || null;
          console.log("📝 Transcription result:", messageText);
        }
      }
    }

    const phoneNumber = payload.from;
    const senderName = payload.whatsapp?.senderName || 'User';
    
    if (!phoneNumber || !messageText) {
      return NextResponse.json({ status: 'ignored' });
    }

    const command = messageText.toLowerCase();

    // Extra Feature 1: Help Command
    if (command === 'help' || command === '/help') {
      await sendWhatsAppText(
        phoneNumber,
        `🎨 *ArtBot Help* 🎨\n\n` +
        `Simply send any text or voice message to generate an AI image!\n\n` +
        `*Features:*\n` +
        `• *Multilingual:* Type in Hindi, English, etc.\n` +
        `• *Negative Prompts:* Add "NO: things you don't want" at the end.\n` +
        `• *history:* See your last 3 creations`
      );
      return NextResponse.json({ status: 'success' });
    }

    // Extra Feature 2: History Command
    if (command === 'history' || command === '/history') {
      const { data: history, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error || !history || history.length === 0) {
        await sendWhatsAppText(phoneNumber, "You haven't generated any art yet! Send me a prompt or voice note to start. 🎨");
      } else {
        await sendWhatsAppText(phoneNumber, "📜 *Your Recent Art History:*");
        for (const item of history) {
          await sendWhatsAppImage(phoneNumber, item.image_url, `🖼️ Prompt: ${item.original_prompt}`);
        }
      }
      return NextResponse.json({ status: 'success' });
    }

    // Extra Feature 3: Rate Limiting Check (Max 5 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', phoneNumber)
      .gt('created_at', oneHourAgo);

    if (count !== null && count >= 5) {
      await sendWhatsAppText(
        phoneNumber, 
        "⏳ *Rate Limit Reached*\n\nYou've generated 5 images in the last hour. Please wait a bit! 🎨"
      );
      return NextResponse.json({ status: 'rate-limited' });
    }

    // Step 1: Send acknowledgment message
    await sendWhatsAppText(
      phoneNumber,
      `🎨 *Generating your art...*\n\nPrompt: "${messageText}"\n\n⏳ Please wait 10-15 seconds...`
    );

    // Extra Feature 4: Negative Prompt Parsing
    let cleanPrompt = messageText;
    let negativePrompt = '';
    if (messageText.toUpperCase().includes('NO:')) {
      const parts = messageText.split(/NO:/i);
      cleanPrompt = parts[0].trim();
      negativePrompt = parts[1].trim();
    }

    // Step 2: Detect language using Mistral
    const language = await detectLanguage(cleanPrompt);

    // Prepare prompt with negative details if any
    let finalPromptToEnhance = cleanPrompt;
    if (negativePrompt) finalPromptToEnhance += ` (Avoid: ${negativePrompt})`;

    // Step 3: Enhance prompt using Groq
    const enhancedPrompt = await enhancePrompt(finalPromptToEnhance, language);

    // Step 4: Generate image using Pollinations.AI
    const imageUrl = await generateImage(enhancedPrompt);

    // Step 5: Send image back on WhatsApp
    const caption = `✅ *Your AI Art is ready!*\n\n🖼️ *Original:* ${cleanPrompt}\n✨ *Enhanced:* ${enhancedPrompt.substring(0, 100)}...\n\n_Send another prompt or voice message!_ 🎨`;
    
    await sendWhatsAppImage(phoneNumber, imageUrl, caption);

    // Step 6: Save to Supabase
    // Upsert user
    const { data: user } = await supabase
      .from('users')
      .upsert(
        { phone_number: phoneNumber, name: senderName, last_active: new Date().toISOString() },
        { onConflict: 'phone_number' }
      )
      .select('id')
      .single();

    // Log generation
    await supabase.from('image_generations').insert({
      user_id: user?.id,
      phone_number: phoneNumber,
      original_prompt: messageText,
      detected_language: language,
      enhanced_prompt: enhancedPrompt,
      image_url: imageUrl,
      pollinations_url: imageUrl,
      status: 'success',
      processing_time_ms: Date.now() - startTime,
    });

    // Update user count
    const { data: existingUser } = await supabase
        .from('users')
        .select('total_images_generated')
        .eq('phone_number', phoneNumber)
        .single();
    
    if (existingUser) {
        await supabase
            .from('users')
            .update({ total_images_generated: existingUser.total_images_generated + 1 })
            .eq('phone_number', phoneNumber);
    }

    // Update Daily Stats
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyStat } = await supabase.from('daily_stats').select('*').eq('date', today).single();

    if (dailyStat) {
      await supabase.from('daily_stats').update({
        total_requests: dailyStat.total_requests + 1,
        successful_generations: dailyStat.successful_generations + 1
      }).eq('date', today);
    } else {
      await supabase.from('daily_stats').insert({
        date: today,
        total_requests: 1,
        successful_generations: 1,
        failed_generations: 0,
        unique_users: 1
      });
    }

    return NextResponse.json({ status: 'success' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook is active ✅ (Advanced Version)' });
}
