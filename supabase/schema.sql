-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  total_images_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image generations table
CREATE TABLE image_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phone_number TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  detected_language TEXT DEFAULT 'en',
  enhanced_prompt TEXT NOT NULL,
   image_url TEXT NOT NULL,
   pollinations_url TEXT,
   stability_url TEXT,
   status TEXT DEFAULT 'success', -- success | failed | pending
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats table
CREATE TABLE daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE DEFAULT CURRENT_DATE,
  total_requests INTEGER DEFAULT 0,
  successful_generations INTEGER DEFAULT 0,
  failed_generations INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0
);

-- Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON image_generations FOR ALL USING (true);

-- WhatsApp Messages Log Table
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT,
  channel TEXT,
  from_number TEXT NOT NULL,
  to_number TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  content_type TEXT,
  content_text TEXT,
  sender_name TEXT,
  event_type TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON whatsapp_messages FOR ALL USING (true);