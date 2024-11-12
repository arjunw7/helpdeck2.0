-- Create articles table
create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  content jsonb not null,
  visibility text not null default 'private',
  views integer not null default 0,
  status text not null default 'draft',
  slug text not null unique,
  category_id uuid references categories(id) not null,
  org_id uuid not null references organizations(id),
  created_by uuid not null references profiles(id),
  updated_by uuid not null references profiles(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint status_check check (status in ('draft', 'published', 'unpublished', 'archived')),
  constraint visibility_check check (visibility in ('public', 'private'))
);

-- Enable RLS
alter table articles enable row level security;

-- Policies
create policy "Users can view articles in their organization"
  on articles for select
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can create articles in their organization"
  on articles for insert
  with check (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can update articles in their organization"
  on articles for update
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can delete articles in their organization"
  on articles for delete
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
    )
  );

-- Indexes
create index articles_org_id_idx on articles(org_id);
create index articles_category_id_idx on articles(category_id);
create index articles_slug_idx on articles(slug);
create index articles_status_idx on articles(status);
create index articles_visibility_idx on articles(visibility);