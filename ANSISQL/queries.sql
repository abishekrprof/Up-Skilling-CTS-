-- ==========================================================================
-- ANSI SQL USING MYSQL - CIVIL PORTAL ANALYTICS ENGINE
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Upcoming Event Registrations Matching Citizen Home City
-- --------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS user_name,
    u.city AS resident_city,
    e.event_id,
    e.title AS event_title,
    e.start_date AS event_date,
    e.status
FROM Registrations r
JOIN Users u ON r.user_id = u.user_id
JOIN Events e ON r.event_id = e.event_id
WHERE e.status = 'upcoming' 
  AND u.city = e.city
ORDER BY e.start_date ASC;


-- --------------------------------------------------------------------------
-- Top-Rated Events with Statistically Significant Feedback Counts
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    ROUND(AVG(f.rating), 2) AS average_rating,
    COUNT(f.feedback_id) AS total_feedback_count
FROM Events e
JOIN Feedback f ON e.event_id = f.event_id
GROUP BY e.event_id, e.title
HAVING COUNT(f.feedback_id) >= 10
ORDER BY average_rating DESC, total_feedback_count DESC;


-- --------------------------------------------------------------------------
-- Inactive Citizens (No Registrations Registered Within 90 Days)
-- --------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS user_name,
    u.email,
    u.city,
    u.registration_date
FROM Users u
WHERE u.user_id NOT IN (
    SELECT DISTINCT r.user_id
    FROM Registrations r
    WHERE r.registration_date >= CURDATE() - INTERVAL 90 DAY
)
ORDER BY u.user_id;


-- --------------------------------------------------------------------------
-- Sessions Running During Peak Hours (10:00 AM to 12:00 PM)
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    COUNT(s.session_id) AS peak_sessions_count
FROM Events e
LEFT JOIN Sessions s ON e.event_id = s.event_id 
    AND TIME(s.start_time) >= '10:00:00' 
    AND TIME(s.end_time) <= '12:00:00'
GROUP BY e.event_id, e.title
ORDER BY peak_sessions_count DESC;


-- --------------------------------------------------------------------------
-- Top Active Resident Cities by Total Volume of Registrations
-- --------------------------------------------------------------------------
SELECT 
    u.city AS user_city,
    COUNT(DISTINCT r.registration_id) AS total_distinct_registrations
FROM Registrations r
JOIN Users u ON r.user_id = u.user_id
GROUP BY u.city
ORDER BY total_distinct_registrations DESC
LIMIT 5;


-- --------------------------------------------------------------------------
-- Document Resource Types Upload Summary by Event
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    SUM(CASE WHEN r.resource_type = 'pdf' THEN 1 ELSE 0 END) AS pdf_count,
    SUM(CASE WHEN r.resource_type = 'image' THEN 1 ELSE 0 END) AS image_count,
    SUM(CASE WHEN r.resource_type = 'link' THEN 1 ELSE 0 END) AS link_count,
    COUNT(r.resource_id) AS total_uploaded_resources
FROM Events e
LEFT JOIN Resources r ON e.event_id = r.event_id
GROUP BY e.event_id, e.title
ORDER BY total_uploaded_resources DESC;


-- --------------------------------------------------------------------------
-- Low Rating Alerts (Ratings Under 3 Stars with Comments)
-- --------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS citizen_name,
    e.title AS event_title,
    f.rating AS given_rating,
    f.comments AS citizen_comments,
    f.feedback_date
FROM Feedback f
JOIN Users u ON f.user_id = u.user_id
JOIN Events e ON f.event_id = e.event_id
WHERE f.rating < 3
ORDER BY f.rating ASC;


-- --------------------------------------------------------------------------
-- Count of Active Sessions for Upcoming Events
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS upcoming_event,
    e.start_date,
    COUNT(s.session_id) AS scheduled_sessions
FROM Events e
LEFT JOIN Sessions s ON e.event_id = s.event_id
WHERE e.status = 'upcoming'
GROUP BY e.event_id, e.title, e.start_date
ORDER BY e.start_date ASC;


-- --------------------------------------------------------------------------
-- Organizer Events Creation Summary and Status Metrics
-- --------------------------------------------------------------------------
SELECT 
    u.user_id AS organizer_id,
    u.full_name AS organizer_name,
    e.status AS event_status,
    COUNT(e.event_id) AS events_created
FROM Users u
JOIN Events e ON u.user_id = e.organizer_id
GROUP BY u.user_id, u.full_name, e.status
ORDER BY organizer_name ASC, event_status ASC;


-- --------------------------------------------------------------------------
-- Events with Registrations That Have Zero Submitted Feedback (Feedback Gap)
-- --------------------------------------------------------------------------
SELECT DISTINCT
    e.event_id,
    e.title AS event_title
FROM Events e
JOIN Registrations r ON e.event_id = r.event_id
LEFT JOIN Feedback f ON e.event_id = f.event_id
WHERE f.feedback_id IS NULL
ORDER BY e.event_id;


-- --------------------------------------------------------------------------
-- Daily Registration Count of New Portal Citizens (Last 7 Days)
-- --------------------------------------------------------------------------
SELECT 
    registration_date,
    COUNT(user_id) AS new_registered_citizens
FROM Users
WHERE registration_date >= CURDATE() - INTERVAL 7 DAY
GROUP BY registration_date
ORDER BY registration_date DESC;


-- --------------------------------------------------------------------------
-- Identify Events with the Greatest Number of Associated Sessions
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    COUNT(s.session_id) AS session_count
FROM Events e
JOIN Sessions s ON e.event_id = s.event_id
GROUP BY e.event_id, e.title
HAVING session_count = (
    SELECT MAX(session_cnt)
    FROM (
        SELECT COUNT(session_id) AS session_cnt
        FROM Sessions
        GROUP BY event_id
    ) AS temp
);


-- --------------------------------------------------------------------------
-- Average Feedback Ratings Grouped by Event City
-- --------------------------------------------------------------------------
SELECT 
    e.city AS venue_city,
    ROUND(AVG(f.rating), 2) AS average_feedback_rating,
    COUNT(f.feedback_id) AS total_feedback_count
FROM Events e
JOIN Feedback f ON e.event_id = f.event_id
GROUP BY e.city
ORDER BY average_feedback_rating DESC;


-- --------------------------------------------------------------------------
-- Most Popular Events by Total Citizen Registrations Count
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    COUNT(r.registration_id) AS total_registrations
FROM Events e
LEFT JOIN Registrations r ON e.event_id = r.event_id
GROUP BY e.event_id, e.title
ORDER BY total_registrations DESC
LIMIT 3;


-- --------------------------------------------------------------------------
-- Conflict Finder: Sessional Time Overlaps within the Same Event
-- --------------------------------------------------------------------------
SELECT 
    s1.event_id,
    e.title AS event_title,
    s1.session_id AS first_session_id,
    s1.title AS first_session_title,
    s1.start_time AS first_session_start,
    s1.end_time AS first_session_end,
    s2.session_id AS second_session_id,
    s2.title AS second_session_title,
    s2.start_time AS second_session_start,
    s2.end_time AS second_session_end
FROM Sessions s1
JOIN Sessions s2 ON s1.event_id = s2.event_id 
    AND s1.session_id < s2.session_id
JOIN Events e ON s1.event_id = e.event_id
WHERE s1.start_time < s2.end_time 
  AND s1.end_time > s2.start_time
ORDER BY s1.event_id;


-- --------------------------------------------------------------------------
-- Unregistered Citizens Who Opened Accounts Within the Last 30 Days
-- --------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS citizen_name,
    u.email,
    u.registration_date
FROM Users u
LEFT JOIN Registrations r ON u.user_id = r.user_id
WHERE u.registration_date >= CURDATE() - INTERVAL 30 DAY
  AND r.registration_id IS NULL
ORDER BY u.registration_date DESC;


-- --------------------------------------------------------------------------
-- Speakers Assigned to Multiple Sessions Across all Civic Venues
-- --------------------------------------------------------------------------
SELECT 
    speaker_name,
    COUNT(session_id) AS total_sessions_assigned,
    COUNT(DISTINCT event_id) AS distinct_events_involved
FROM Sessions
GROUP BY speaker_name
HAVING COUNT(session_id) > 1
ORDER BY total_sessions_assigned DESC;


-- --------------------------------------------------------------------------
-- Events Lacking Any Uploaded Material or Resource Files
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    e.city AS event_city,
    e.status
FROM Events e
LEFT JOIN Resources r ON e.event_id = r.event_id
WHERE r.resource_id IS NULL
ORDER BY e.event_id;


-- --------------------------------------------------------------------------
-- Completed Events Analytics Summary (Total Sign-ups and Avg Ratings)
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS completed_event,
    COUNT(DISTINCT r.registration_id) AS total_registrations,
    ROUND(AVG(f.rating), 2) AS average_feedback_rating
FROM Events e
LEFT JOIN Registrations r ON e.event_id = r.event_id
LEFT JOIN Feedback f ON e.event_id = f.event_id
WHERE e.status = 'completed'
GROUP BY e.event_id, e.title;


-- --------------------------------------------------------------------------
-- User Engagement Metrics: Total Registrations vs Feedback Submitted
-- --------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS citizen_name,
    COUNT(DISTINCT r.registration_id) AS total_events_registered,
    COUNT(DISTINCT f.feedback_id) AS total_feedbacks_submitted
FROM Users u
LEFT JOIN Registrations r ON u.user_id = r.user_id
LEFT JOIN Feedback f ON u.user_id = f.user_id
GROUP BY u.user_id, u.full_name
ORDER BY total_events_registered DESC, total_feedbacks_submitted DESC;


-- --------------------------------------------------------------------------
-- Top Active Citizens by Quantity of Submitted Feedback Entries
-- --------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS citizen_name,
    u.email,
    COUNT(f.feedback_id) AS feedback_count
FROM Users u
JOIN Feedback f ON u.user_id = f.user_id
GROUP BY u.user_id, u.full_name, u.email
ORDER BY feedback_count DESC, citizen_name ASC
LIMIT 5;


-- --------------------------------------------------------------------------
-- Security Audit: Detect Duplicate User Sign-ups for the Same Event
-- --------------------------------------------------------------------------
SELECT 
    user_id,
    event_id,
    COUNT(registration_id) AS duplicate_registrations_found
FROM Registrations
GROUP BY user_id, event_id
HAVING COUNT(registration_id) > 1;


-- --------------------------------------------------------------------------
-- Monthly Registration Count and Growth Trends (Past 12 Months)
-- --------------------------------------------------------------------------
SELECT 
    DATE_FORMAT(registration_date, '%Y-%m') AS registration_month,
    COUNT(registration_id) AS registrations_count
FROM Registrations
WHERE registration_date >= CURDATE() - INTERVAL 12 MONTH
GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
ORDER BY registration_month ASC;


-- --------------------------------------------------------------------------
-- Average Session Duration in Minutes per Event
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)), 1) AS avg_session_duration_mins
FROM Events e
JOIN Sessions s ON e.event_id = s.event_id
GROUP BY e.event_id, e.title
ORDER BY avg_session_duration_mins DESC;


-- --------------------------------------------------------------------------
-- Events Lacking Scheduled Sessional Agendas
-- --------------------------------------------------------------------------
SELECT 
    e.event_id,
    e.title AS event_title,
    e.city AS event_city,
    e.status
FROM Events e
LEFT JOIN Sessions s ON e.event_id = s.event_id
WHERE s.session_id IS NULL
ORDER BY e.event_id;
