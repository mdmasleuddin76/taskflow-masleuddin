CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Test User
INSERT INTO users (id, name, email, password)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test Evaluator',
    'test@example.com',
    crypt('password123', gen_salt('bf', 12))
) ON CONFLICT (email) DO NOTHING;

-- 2. Create Test Project
INSERT INTO projects (id, name, description, owner_id)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'TaskFlow Launch',
    'Get TaskFlow ready for production deployment.',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT DO NOTHING;

-- 3. Create 3 Test Tasks
INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date)
VALUES 
    ('Design Database Schema', 'Create the initial ERD and SQL migrations.', 'done', 'high', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-04-10'),
    ('Implement JWT Auth', 'Setup bcrypt hashing, cookies, and middleware.', 'in_progress', 'high', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-04-15'),
    ('Write README Documentation', 'Include all Docker instructions and architecture decisions.', 'todo', 'medium', '22222222-2222-2222-2222-222222222222', NULL, '2026-04-20');