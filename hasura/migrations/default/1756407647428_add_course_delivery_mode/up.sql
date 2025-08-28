-- Add delivery_mode column to course table
ALTER TABLE course ADD COLUMN delivery_mode TEXT;

-- Add constraint for valid values
ALTER TABLE course ADD CONSTRAINT course_delivery_mode_check 
  CHECK (delivery_mode IN ('in_person_only', 'online_only', 'both', NULL));

-- Populate delivery_mode for courses based on section meeting data
-- Logic: 
-- - online_only: all sections have start_seconds=0 AND end_seconds=0
-- - in_person_only: all sections have start_seconds>0 AND end_seconds>0  
-- - both: mix of online and in-person sections

UPDATE course 
SET delivery_mode = (
  WITH latest_term AS (
    SELECT MAX(id) as term_id FROM term
  ),
  course_delivery_analysis AS (
    SELECT 
      c.id as course_id,
      COUNT(DISTINCT cs.id) as total_sections,
      COUNT(DISTINCT CASE 
        WHEN sm.start_seconds = 0 AND sm.end_seconds = 0 THEN cs.id 
      END) as online_sections,
      COUNT(DISTINCT CASE 
        WHEN sm.start_seconds > 0 AND sm.end_seconds > 0 THEN cs.id 
      END) as inperson_sections
    FROM course c
    JOIN course_section cs ON c.id = cs.course_id
    JOIN section_meeting sm ON cs.id = sm.section_id
    JOIN latest_term lt ON cs.term_id = lt.term_id
    JOIN term t ON cs.term_id = t.id
    WHERE sm.start_date >= t.start_date 
      AND sm.end_date <= t.end_date
      AND c.id = course.id  -- Reference outer query
    GROUP BY c.id
  )
  SELECT 
    CASE 
      WHEN online_sections > 0 AND inperson_sections = 0 THEN 'online_only'
      WHEN online_sections = 0 AND inperson_sections > 0 THEN 'in_person_only'
      WHEN online_sections > 0 AND inperson_sections > 0 THEN 'both'
      ELSE NULL
    END
  FROM course_delivery_analysis
  WHERE course_delivery_analysis.course_id = course.id
)
WHERE EXISTS (
  SELECT 1 
  FROM course_section cs 
  JOIN term t ON cs.term_id = t.id
  WHERE cs.course_id = course.id 
    AND cs.term_id = (SELECT MAX(id) FROM term)
);