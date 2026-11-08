begin;
create extension if not exists pgcrypto;
create table if not exists public.device_installs (
 id uuid primary key default gen_random_uuid(), anon_device_id text unique not null check (anon_device_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
 chapter_slug text not null default 'general', platform text, created_at timestamptz not null default now()
);
create table if not exists public.anonymous_questions (
 id uuid primary key default gen_random_uuid(), category text not null check (category in ('srhr','mental_health','digital_safety','period_dignity')),
 chapter_slug text not null default 'general', question_text text not null check (char_length(question_text) between 10 and 2000),
 answer_text text, answered_by text not null default 'Certified Health Facilitator & Adult Champion',
 status text not null default 'pending' check (status in ('pending','published','archived')),
 is_flagged_urgent boolean not null default false, upvotes integer not null default 0 check (upvotes >= 0), created_at timestamptz not null default now(),
 constraint published_answer check (status <> 'published' or char_length(trim(answer_text)) >= 10)
);
create table if not exists public.club_chapters (
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
 institution_type text not null check (institution_type in ('University','High School')), city text not null,
 trained_advocates_count integer not null default 20 check (trained_advocates_count >= 0), active_members_count integer not null default 45 check (active_members_count >= 0),
 pad_kits_available integer not null default 50 check (pad_kits_available >= 0), pad_kits_target integer not null default 150 check (pad_kits_target > 0),
 next_circle_day text not null default 'Tuesday, 3:30 PM', updated_at timestamptz not null default now()
);
alter table public.device_installs enable row level security;
alter table public.anonymous_questions enable row level security;
alter table public.club_chapters enable row level security;
revoke all on public.device_installs,public.anonymous_questions,public.club_chapters from anon,authenticated;
grant insert (anon_device_id,chapter_slug,platform) on public.device_installs to anon;
grant insert (id,category,chapter_slug,question_text,is_flagged_urgent) on public.anonymous_questions to anon;
grant select on public.anonymous_questions,public.club_chapters to anon;
grant all on public.device_installs,public.anonymous_questions,public.club_chapters to service_role;
create policy install_insert on public.device_installs for insert to anon with check (true);
create policy question_insert on public.anonymous_questions for insert to anon with check (status='pending' and answer_text is null and upvotes=0);
create policy published_questions on public.anonymous_questions for select to anon using (status='published');
create policy chapter_read on public.club_chapters for select to anon using (true);
create index if not exists questions_status_created on public.anonymous_questions(status,created_at desc);
-- No anonymous UPDATE or DELETE grants or policies. Admin writes use server verification.
-- Do not seed fictional partner or impact records into a production database.
commit;
