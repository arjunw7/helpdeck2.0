import { supabase } from "@/lib/supabase";

export interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  content: string | any; // Allow both string and JSON content
  visibility: "public" | "private";
  views: number;
  status: "draft" | "published" | "archived";
  slug: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  profiles: {
    full_name: string;
  };
  categories: {
    name: string;
  };
}

export async function getArticles() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile?.org_id) {
    throw new Error("Organization not found");
  }

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      profiles:created_by (
        full_name
      ),
      categories:category_id (
        name
      )
    `)
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getArticle(id: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      profiles:created_by (
        full_name
      ),
      categories:category_id (
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createArticle(articleData: {
  title: string;
  subtitle?: string;
  content: any;
  visibility: "public" | "private";
  status: "draft" | "published";
  category_id: string;
  slug: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile?.org_id) {
    throw new Error("Organization not found");
  }

  const { data, error } = await supabase
    .from("articles")
    .insert([
      {
        ...articleData,
        org_id: profile.org_id,
        created_by: user.id,
        updated_by: user.id,
      },
    ])
    .select(`
      *,
      profiles:created_by (
        full_name
      ),
      categories:category_id (
        name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateArticle(id: string, articleData: {
  title: string;
  subtitle?: string;
  content: any;
  visibility: "public" | "private";
  status: "draft" | "published" | "archived";
  category_id: string;
  slug: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("articles")
    .update({
      ...articleData,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      profiles:created_by (
        full_name
      ),
      categories:category_id (
        name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateArticleVotes(id: string, votes: { upvotes: number; downvotes: number }) {
  const { data, error } = await supabase
    .from("articles")
    .update({
      upvotes: votes.upvotes,
      downvotes: votes.downvotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}