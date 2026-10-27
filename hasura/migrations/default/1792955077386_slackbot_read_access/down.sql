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
