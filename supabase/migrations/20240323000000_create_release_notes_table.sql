-- Create release_notes table
create table release_notes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  version text not null,
  type text not null,
  changes jsonb not null default '[]',
  status text not null default 'draft',
  org_id uuid not null references organizations(id),
  created_by uuid not null references profiles(id),
  updated_by uuid not null references profiles(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  published_at timestamp with time zone,
  constraint status_check check (status in ('draft', 'published', 'archived')),
  constraint type_check check (type in ('major', 'minor', 'patch'))
);

-- Enable RLS
alter table release_notes enable row level security;

-- Policies
create policy "Users can view release notes in their organization"
  on release_notes for select
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can create release notes in their organization"
  on release_notes for insert
  with check (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can update release notes in their organization"
  on release_notes for update
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can delete release notes in their organization"
  on release_notes for delete
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

-- Indexes
create index release_notes_org_id_idx on release_notes(org_id);
create index release_notes_version_idx on release_notes(version);
create index release_notes_type_idx on release_notes(type);
create index release_notes_status_idx on release_notes(status);
create index release_notes_created_at_idx on release_notes(created_at desc);