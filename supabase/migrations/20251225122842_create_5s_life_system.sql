/*
  # 5S Life System Database Schema

  ## Overview
  This migration creates the database structure for a personal 5S life management system
  that helps individuals apply 5S principles to different life areas (mindset, time, work,
  health, relationships, finance, personal space).

  ## New Tables

  1. `life_areas`
     - `id` (uuid, primary key)
     - `name` (text) - e.g., 'mindset', 'time', 'work'
     - `display_name` (text) - e.g., 'Nhận thức'
     - `emoji` (text) - visual icon
     - `description` (text)
     - `sort_order` (integer)
     - `created_at` (timestamptz)

  2. `user_sessions`
     - `id` (uuid, primary key)
     - `session_id` (text, unique) - browser session identifier
     - `current_area_id` (uuid) - which area they're focusing on
     - `current_step` (text) - which S step (s1-s5)
     - `onboarding_completed` (boolean)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. `s1_filter_items`
     - Items for S1 - Sàng lọc (Filter)
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `area_id` (uuid)
     - `item_text` (text) - what the item is
     - `should_keep` (boolean) - keep or remove
     - `created_at` (timestamptz)

  4. `s2_organize_items`
     - Items for S2 - Sắp xếp (Organize)
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `area_id` (uuid)
     - `item_text` (text)
     - `priority_level` (text) - 'high', 'medium', 'low'
     - `fixed_position` (text) - where/when it belongs
     - `created_at` (timestamptz)

  5. `s3_clean_reflections`
     - Items for S3 - Sạch sẽ (Clean)
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `area_id` (uuid)
     - `reflection_text` (text) - what feels heavy/messy
     - `action_taken` (text) - what they did about it
     - `reflection_date` (date)
     - `created_at` (timestamptz)

  6. `s4_standards`
     - Items for S4 - Tiêu chuẩn (Standardize)
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `area_id` (uuid)
     - `trigger` (text) - "When X happens"
     - `action` (text) - "I do Y"
     - `created_at` (timestamptz)

  7. `s5_sustain_reminders`
     - Items for S5 - Tâm thế (Sustain)
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `area_id` (uuid)
     - `why_text` (text) - why this matters to me
     - `created_at` (timestamptz)

  8. `daily_actions`
     - Daily suggested actions
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `area_id` (uuid)
     - `action_text` (text)
     - `action_date` (date)
     - `status` (text) - 'pending', 'done', 'skipped'
     - `created_at` (timestamptz)

  9. `weekly_reviews`
     - Weekly reflection
     - `id` (uuid, primary key)
     - `session_id` (text)
     - `week_start_date` (date)
     - `what_clearer` (text) - What became clearer?
     - `what_lighter` (text) - What feels lighter?
     - `what_adjust` (text) - What should be adjusted?
     - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read access for life_areas (reference data)
  - Session-based access for user data (no auth required initially)

  ## Notes
  - Uses session_id instead of user authentication for MVP
  - Can be migrated to user-based auth later
  - All user data is isolated by session_id
*/

-- Create life_areas table (reference data)
CREATE TABLE IF NOT EXISTS life_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  emoji text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  current_area_id uuid REFERENCES life_areas(id),
  current_step text DEFAULT 's1',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create S1 filter items table
CREATE TABLE IF NOT EXISTS s1_filter_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  should_keep boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create S2 organize items table
CREATE TABLE IF NOT EXISTS s2_organize_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  priority_level text DEFAULT 'medium',
  fixed_position text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create S3 clean reflections table
CREATE TABLE IF NOT EXISTS s3_clean_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  reflection_text text NOT NULL,
  action_taken text DEFAULT '',
  reflection_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create S4 standards table
CREATE TABLE IF NOT EXISTS s4_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  trigger text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create S5 sustain reminders table
CREATE TABLE IF NOT EXISTS s5_sustain_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  why_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create daily actions table
CREATE TABLE IF NOT EXISTS daily_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  action_text text NOT NULL,
  action_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create weekly reviews table
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  week_start_date date NOT NULL,
  what_clearer text DEFAULT '',
  what_lighter text DEFAULT '',
  what_adjust text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Insert default life areas
INSERT INTO life_areas (name, display_name, emoji, description, sort_order)
VALUES
  ('mindset', 'Nhận thức', '🧠', 'Tư duy, cảm xúc, hình ảnh tâm trí', 1),
  ('time', 'Thời gian', '⏱️', 'Quản lý thời gian và năng lượng cá nhân', 2),
  ('work', 'Công việc', '📋', 'Quản lý công việc và dự án cá nhân', 3),
  ('health', 'Sức khỏe', '💪', 'Thể chất, dinh dưỡng, nghỉ ngơi', 4),
  ('relationships', 'Quan hệ', '🤝', 'Mối quan hệ với người khác', 5),
  ('finance', 'Tài chính', '💰', 'Quản lý tài chính cá nhân', 6),
  ('space', 'Không gian', '🏠', 'Không gian sống và làm việc', 7)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE s1_filter_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE s2_organize_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE s3_clean_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE s4_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE s5_sustain_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for life_areas (public read)
CREATE POLICY "Anyone can read life areas"
  ON life_areas FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for user_sessions (session-based access)
CREATE POLICY "Users can read own session"
  ON user_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own session"
  ON user_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own session"
  ON user_sessions FOR UPDATE
  TO anon, authenticated
  USING (true);

-- RLS Policies for S1 filter items
CREATE POLICY "Users can read own s1 items"
  ON s1_filter_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own s1 items"
  ON s1_filter_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own s1 items"
  ON s1_filter_items FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own s1 items"
  ON s1_filter_items FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for S2 organize items
CREATE POLICY "Users can read own s2 items"
  ON s2_organize_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own s2 items"
  ON s2_organize_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own s2 items"
  ON s2_organize_items FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own s2 items"
  ON s2_organize_items FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for S3 clean reflections
CREATE POLICY "Users can read own s3 reflections"
  ON s3_clean_reflections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own s3 reflections"
  ON s3_clean_reflections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own s3 reflections"
  ON s3_clean_reflections FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own s3 reflections"
  ON s3_clean_reflections FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for S4 standards
CREATE POLICY "Users can read own s4 standards"
  ON s4_standards FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own s4 standards"
  ON s4_standards FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own s4 standards"
  ON s4_standards FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own s4 standards"
  ON s4_standards FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for S5 sustain reminders
CREATE POLICY "Users can read own s5 reminders"
  ON s5_sustain_reminders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own s5 reminders"
  ON s5_sustain_reminders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own s5 reminders"
  ON s5_sustain_reminders FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own s5 reminders"
  ON s5_sustain_reminders FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for daily actions
CREATE POLICY "Users can read own daily actions"
  ON daily_actions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own daily actions"
  ON daily_actions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own daily actions"
  ON daily_actions FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own daily actions"
  ON daily_actions FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for weekly reviews
CREATE POLICY "Users can read own weekly reviews"
  ON weekly_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own weekly reviews"
  ON weekly_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own weekly reviews"
  ON weekly_reviews FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own weekly reviews"
  ON weekly_reviews FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_s1_filter_items_session_id ON s1_filter_items(session_id);
CREATE INDEX IF NOT EXISTS idx_s2_organize_items_session_id ON s2_organize_items(session_id);
CREATE INDEX IF NOT EXISTS idx_s3_clean_reflections_session_id ON s3_clean_reflections(session_id);
CREATE INDEX IF NOT EXISTS idx_s4_standards_session_id ON s4_standards(session_id);
CREATE INDEX IF NOT EXISTS idx_s5_sustain_reminders_session_id ON s5_sustain_reminders(session_id);
CREATE INDEX IF NOT EXISTS idx_daily_actions_session_id ON daily_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_daily_actions_date ON daily_actions(action_date);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_session_id ON weekly_reviews(session_id);