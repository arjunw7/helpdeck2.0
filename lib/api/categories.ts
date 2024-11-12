import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  parent_id: string | null;
  accessibility: "public" | "private";
  icon: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
  };
}

export async function getCategories() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile?.org_id) {
    throw new Error("Organization not found");
  }

  const { data, error } = await supabase
    .from("categories")
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCategory(categoryData: {
  name: string;
  description: string;
  parent_id: string | null;
  accessibility: "public" | "private";
  icon: string;
}) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile?.org_id) {
    throw new Error("Organization not found");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const slug = categoryData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("categories")
    .insert([
      {
        ...categoryData,
        slug,
        org_id: profile.org_id,
        created_by: user.id,
        updated_by: user.id,
      },
    ])
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, categoryData: {
  name: string;
  description: string;
  accessibility: "public" | "private";
  icon: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      ...categoryData,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}