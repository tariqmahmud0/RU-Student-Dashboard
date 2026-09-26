-- =========================================================================
-- Rajshahi University Student Dashboard
-- Teacher Ratings & Student Feedback System (Supabase Setup)
-- 100% Free Persistent Cloud Database for Vercel / Netlify / Render
-- =========================================================================

-- 1. Create table for teacher ratings & reviews
CREATE TABLE IF NOT EXISTS public.teacher_ratings (
    teacher_key TEXT PRIMARY KEY,
    teacher_name TEXT NOT NULL,
    salary_id TEXT,
    department TEXT,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    criteria_averages JSONB,
    reviews JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index on salary_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_teacher_ratings_salary_id ON public.teacher_ratings(salary_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.teacher_ratings ENABLE ROW LEVEL SECURITY;

-- 4. Create policy: Allow anyone (students & visitors) to read ratings
CREATE POLICY "Allow public read access to teacher ratings" 
ON public.teacher_ratings 
FOR SELECT 
USING (true);

-- 5. Create policy: Allow students to insert or update ratings
CREATE POLICY "Allow public upsert access to teacher ratings" 
ON public.teacher_ratings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- =========================================================================
-- Setup Complete!
-- Now in Supabase:
-- Go to Project Settings -> API
-- Copy:
-- 1. Project URL -> VITE_SUPABASE_URL
-- 2. Project API anon/public key -> VITE_SUPABASE_ANON_KEY
-- Paste them in your Vercel / Netlify Environment Variables or .env.local file.
-- =========================================================================
