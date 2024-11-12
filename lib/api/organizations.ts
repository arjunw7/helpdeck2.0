import { supabase } from "@/lib/supabase";

export interface Organization {
  id: string;
  name: string;
  logo: string;
}

export async function updateOrganization(id: string, data: Partial<Organization>) {
  const { data: updatedOrg, error } = await supabase
    .from("organizations")
    .update({
      ...data,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updatedOrg;
}