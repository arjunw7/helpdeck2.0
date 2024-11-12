create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  slug text not null unique,
  parent_id uuid references categories(id),
  org_id uuid not null references organizations(id),
  accessibility text not null default 'public',
  created_by uuid not null references profiles(id),
  updated_by uuid not null references profiles(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table categories enable row level security;

-- Policies
create policy "Users can view categories in their organization"
  on categories for select
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can create categories in their organization"
  on categories for insert
  with check (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can update categories in their organization"
  on categories for update
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can delete categories in their organization"
  on categories for delete
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

-- Indexes
create index categories_org_id_idx on categories(org_id);
create index categories_parent_id_idx on categories(parent_id);
create index categories_slug_idx on categories(slug);