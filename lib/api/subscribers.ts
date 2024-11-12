import { supabase } from "@/lib/supabase";

export interface Subscriber {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  contact: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
}

export async function getSubscribers() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile?.org_id) {
    throw new Error("Organization not found");
  }

  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSubscriber(subscriberData: {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  company: string;
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
    .from("subscribers")
    .insert([
      {
        first_name: subscriberData.firstName,
        last_name: subscriberData.lastName,
        email: subscriberData.email,
        contact: subscriberData.contact,
        company: subscriberData.company,
        org_id: profile.org_id,
        created_by: user.id,
        updated_by: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscriber(id: string, subscriberData: {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  company: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("subscribers")
    .update({
      first_name: subscriberData.firstName,
      last_name: subscriberData.lastName,
      email: subscriberData.email,
      contact: subscriberData.contact,
      company: subscriberData.company,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function importSubscribers(file: File) {
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

  const text = await file.text();
  const rows = text.split("\n").slice(1); // Skip header row
  const subscribers = rows.map(row => {
    const [firstName, lastName, email, contact, company] = row.split(",");
    return {
      first_name: firstName?.trim() || null,
      last_name: lastName?.trim() || null,
      email: email?.trim(),
      contact: contact?.trim() || null,
      company: company?.trim() || null,
      org_id: profile.org_id,
      created_by: user.id,
      updated_by: user.id,
    };
  }).filter(sub => sub.email); // Only include rows with email

  const { data, error } = await supabase
    .from("subscribers")
    .insert(subscribers)
    .select();

  if (error) throw error;
  return data;
}