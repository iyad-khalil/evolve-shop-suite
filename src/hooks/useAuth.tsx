
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar_url?: string;
}

interface AuthHook {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize la fonction pour éviter les re-renders inutiles
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profileData;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Configuration de l'état d'authentification initial
    const initializeAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            const profileData = await fetchUserProfile(currentSession.user.id);
            if (isMounted && profileData) {
              setProfile(profileData);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Configurer le listener pour les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('Auth state change:', event, newSession?.user?.id);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Utiliser setTimeout pour éviter les conflits avec les listeners
          setTimeout(async () => {
            if (isMounted) {
              const profileData = await fetchUserProfile(newSession.user.id);
              if (isMounted && profileData) {
                setProfile(profileData);
              }
            }
          }, 100);
        } else {
          setProfile(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Initialiser l'authentification
    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    console.log('SignUp attempt:', { email, userData });
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
        }
      });
      
      console.log('SignUp result:', { error });
      return { error };
    } catch (error) {
      console.error('SignUp exception:', error);
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('SignIn attempt:', { email });
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('SignIn result:', { error });
      return { error };
    } catch (error) {
      console.error('SignIn exception:', error);
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut exception:', error);
    }
  }, []);

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };
};
