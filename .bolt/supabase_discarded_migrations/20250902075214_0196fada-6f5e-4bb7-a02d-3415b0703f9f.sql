-- Populate sample community data for better UX

-- Sample competitions
INSERT INTO competitions (title, description, type, habit_category, start_date, end_date, prize_points, status) VALUES
('January Fitness Challenge', 'Complete 30 minutes of exercise daily for the entire month', 'monthly', 'fitness', '2024-01-01'::timestamp, '2024-01-31'::timestamp, 500, 'active'),
('Morning Routine Masters', 'Build the perfect morning routine with your community', 'habit_specific', 'productivity', '2024-01-15'::timestamp, '2024-02-15'::timestamp, 300, 'active'),
('Mindfulness Challenge', 'Daily meditation and mindfulness practices', 'global', 'wellness', '2024-01-10'::timestamp, '2024-02-10'::timestamp, 250, 'active'),
('Reading Revolution', 'Read for at least 20 minutes every day', 'weekly', 'learning', '2024-01-22'::timestamp, '2024-01-28'::timestamp, 150, 'upcoming');

-- Sample marketplace items
INSERT INTO marketplace_items (name, description, category, price_points, image_url, is_premium, is_active) VALUES
('Sunset Theme', 'Beautiful sunset gradient theme for your habit tracker', 'themes', 100, '/themes/sunset.jpg', false, true),
('Productivity Master Badge', 'Show off your productivity skills with this exclusive badge', 'badges', 200, '/badges/productivity.svg', false, true),
('Streak Shield', 'Protect your streak from one missed day', 'streak_insurance', 500, '/items/shield.png', true, true),
('Dark Mode Pro', 'Enhanced dark mode with multiple variants', 'themes', 150, '/themes/dark-pro.jpg', false, true),
('Achievement Hunter Badge', 'For those who collect all achievements', 'badges', 300, '/badges/hunter.svg', false, true),
('Custom Habit Icons', 'Unlock 50+ premium habit icons', 'customizations', 250, '/items/icons.png', true, true);

-- Sample achievements
INSERT INTO achievements (name, description, category, icon, points_reward, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first habit', 'habits', '🎯', 50, 'habit_count', 1),
('Week Warrior', 'Maintain a 7-day streak', 'streaks', '🔥', 100, 'streak', 7),
('Social Butterfly', 'Add 5 friends to your network', 'social', '👥', 150, 'friend_count', 5),
('Competition Champion', 'Win your first competition', 'competitions', '🏆', 300, 'competition_win', 1),
('Habit Master', 'Complete 100 total habits', 'habits', '⭐', 500, 'habit_count', 100),
('Streak Legend', 'Achieve a 30-day streak', 'streaks', '🌟', 1000, 'streak', 30),
('Community Leader', 'Help 10 friends with their habits', 'social', '👑', 750, 'community_participation', 10);

-- Sample activity feed (public activities)
INSERT INTO activity_feed (user_id, activity_type, content, is_public) 
SELECT 
  profiles.user_id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'habit_completed'
    WHEN 1 THEN 'streak_milestone'
    WHEN 2 THEN 'achievement_earned'
    ELSE 'competition_joined'
  END,
  jsonb_build_object(
    'message', 
    CASE (random() * 4)::int
      WHEN 0 THEN 'Completed daily workout!'
      WHEN 1 THEN 'Reached 7-day streak!'
      WHEN 2 THEN 'Earned Week Warrior achievement!'
      ELSE 'Joined January Fitness Challenge!'
    END
  ),
  true
FROM profiles 
LIMIT 10;