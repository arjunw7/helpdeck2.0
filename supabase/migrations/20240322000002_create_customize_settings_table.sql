-- Create customize_settings table
create table customize_settings (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid not null references organizations(id) unique,
  settings jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table customize_settings enable row level security;

-- Policies
create policy "Users can view customize settings in their organization"
  on customize_settings for select
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can create customize settings in their organization"
  on customize_settings for insert
  with check (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can update customize settings in their organization"
  on customize_settings for update
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

-- Indexes
create index customize_settings_org_id_idx on customize_settings(org_id);