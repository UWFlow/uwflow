\set ON_ERROR_STOP on
BEGIN;
INSERT INTO term (id, start_date, end_date)
VALUES (1261, '2026-01-01', '2026-04-30') ON CONFLICT DO NOTHING;
INSERT INTO course (code, name, description)
VALUES ('cs135', 'Preview Introduction to Computer Science', 'Synthetic review test course.')
ON CONFLICT DO NOTHING;
INSERT INTO prof (code, name) VALUES ('preview_professor', 'Preview Professor')
ON CONFLICT DO NOTHING;
COMMIT;
