import { supabase } from "@/lib/supabaseClient";

export interface UserProfile {
  id: string; // This is the user_profile primary key (which might differ from auth.users id if designed that way, but usually it's related)
  user_id: string;
  // Add other profile fields if needed
}

export const profileService = {
  async getCurrentUserProfile() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("*") 
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("No user profile found", profileError);
      return null;
    }

    return profile;
  }
};
