DROP TRIGGER IF EXISTS slackbot_seat_alert_activity ON queue.section_subscribed;
DROP TRIGGER IF EXISTS slackbot_group_join_activity ON shared_group_member;
DROP TRIGGER IF EXISTS slackbot_group_activity ON shared_group;
DROP TRIGGER IF EXISTS slackbot_swap_activity ON user_schedule_swap;
DROP TRIGGER IF EXISTS slackbot_schedule_activity ON user_schedule;
DROP TRIGGER IF EXISTS slackbot_transcript_activity ON user_course_taken;
DROP TRIGGER IF EXISTS slackbot_prof_upvote_activity ON prof_review_upvote;
DROP TRIGGER IF EXISTS slackbot_course_upvote_activity ON course_review_upvote;
DROP TRIGGER IF EXISTS slackbot_shortlist_activity ON user_shortlist;
DROP TRIGGER IF EXISTS slackbot_signup_activity ON "user";
DROP TRIGGER IF EXISTS slackbot_review_activity ON review;
DROP FUNCTION IF EXISTS slackbot_notify_activity();

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'uwflow_slackbot') THEN
    -- The role owns nothing; this revokes its grants so it can be dropped.
    DROP OWNED BY uwflow_slackbot;
    DROP ROLE uwflow_slackbot;
  END IF;
END
$$;
