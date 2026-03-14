-- Add audit logs + compliance reports for governance and traceability

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.compliance_reports (
  id uuid primary key default gen_random_uuid(),
  generated_by uuid references public.profiles(id),
  report_type text not null,
  file_format text default 'json',
  filters jsonb default '{}'::jsonb,
  row_count int default 0,
  generated_at timestamptz default now()
);

alter table public.audit_logs enable row level security;
alter table public.compliance_reports enable row level security;

drop policy if exists "Admins can view audit logs" on public.audit_logs;
drop policy if exists "Admins can insert audit logs" on public.audit_logs;
drop policy if exists "Compliance can view audit logs" on public.audit_logs;
drop policy if exists "Compliance can insert audit logs" on public.audit_logs;
create policy "Compliance can view audit logs" on public.audit_logs for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'compliance'
  ));
create policy "Compliance can insert audit logs" on public.audit_logs for insert
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'compliance'
  ));

drop policy if exists "Admins can manage compliance reports" on public.compliance_reports;
drop policy if exists "Compliance can manage compliance reports" on public.compliance_reports;
create policy "Compliance can manage compliance reports" on public.compliance_reports for all
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'compliance'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'compliance'
  ));

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_event_type_idx on public.audit_logs (event_type);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index if not exists compliance_reports_generated_at_idx on public.compliance_reports (generated_at desc);
