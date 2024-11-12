import { supabase } from "@/lib/supabase";

export interface ReleaseNote {
  id: string;
  title: string;
  description: string;
  version: string;
  type: string[];
  changes: string[];
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at: string | null;
  profiles: {
    full_name: string;
  };
}

export async function getReleaseNotes() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile?.org_id) {
    throw new Error("Organization not found");
  }

  const { data, error } = await supabase
    .from("release_notes")
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

export async function getReleaseNote(id: string) {
  const { data, error } = await supabase
    .from("release_notes")
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createReleaseNote(noteData: {
  title: string;
  description: any;
  version: string;
  type: string[];
  changes: string[];
  status: "draft" | "published";
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

  // Convert description to string if it's an object
  const description = typeof noteData.description === 'object' 
    ? JSON.stringify(noteData.description)
    : noteData.description;

  const { data, error } = await supabase
    .from("release_notes")
    .insert([
      {
        ...noteData,
        description,
        org_id: profile.org_id,
        created_by: user.id,
        updated_by: user.id,
        published_at: noteData.status === "published" ? new Date().toISOString() : null,
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

export async function updateReleaseNote(id: string, noteData: {
  title: string;
  description: any;
  version: string;
  type: string[];
  changes: string[];
  status: "draft" | "published" | "archived";
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Convert description to string if it's an object
  const description = typeof noteData.description === 'object' 
    ? JSON.stringify(noteData.description)
    : noteData.description;

  const { data, error } = await supabase
    .from("release_notes")
    .update({
      ...noteData,
      description,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      published_at: noteData.status === "published" ? new Date().toISOString() : null,
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