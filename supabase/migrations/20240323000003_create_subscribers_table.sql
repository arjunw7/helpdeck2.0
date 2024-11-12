-- Create subscribers table
create table subscribers (
  id uuid default uuid_generate_v4() primary key,
  first_name text,
  last_name text,
  email text not null,
  contact text,
  company text,
  org_id uuid not null references organizations(id),
  created_by uuid not null references profiles(id),
  updated_by uuid not null references profiles(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table subscribers enable row level security;

-- Add unique constraint for email within an organization
alter table subscribers
add constraint unique_email_per_org unique (org_id, email);

-- Policies
create policy "Users can view subscribers in their organization"
  on subscribers for select
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can create subscribers in their organization"
  on subscribers for insert
  with check (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can update subscribers in their organization"
  on subscribers for update
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can delete subscribers in their organization"
  on subscribers for delete
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

-- Indexes
create index subscribers_org_id_idx on subscribers(org_id);
create index subscribers_email_idx on subscribers(email);
create index subscribers_created_at_idx on subscribers(created_at desc);