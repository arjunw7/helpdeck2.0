import { supabase } from './supabase';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  timezone: string;
  created_at: string;
}

export async function getUserOrganization() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'No authenticated user'
      };
    }

    // Get user profile with organization ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found
        return {
          data: {
            organization: null,
            needsOnboarding: true
          },
          error: null
        };
      }
      throw profileError;
    }

    if (!profile?.org_id) {
      return {
        data: {
          organization: null,
          needsOnboarding: true
        },
        error: null
      };
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .single();

    if (orgError) throw orgError;

    return {
      data: {
        organization,
        needsOnboarding: false
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch organization'
    };
  }
}