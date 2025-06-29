
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
    console.log('👤 === FETCHING USER PROFILE ===');
    console.log('👤 Fetching profile for user ID:', userId);
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('👤 Profile query result:', { profileData, error });
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      if (profileData) {
        console.log('✅ Profile found:', profileData);
        console.log('✅ User role:', profileData.role);
        console.log('✅ User name:', `${profileData.first_name} ${profileData.last_name}`);
      } else {
        console.log('⚠️ No profile found for user ID:', userId);
      }

      return profileData;
    } catch (error) {
      console.error('💥 Exception fetching profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log('🚀 === AUTH HOOK INITIALIZATION ===');

    // Configuration de l'état d'authentification initial
    const initializeAuth = async () => {
      console.log('🔑 Initializing authentication...');
      
      try {
        // Récupérer la session actuelle
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        console.log('🔑 Current session result:', { currentSession, error });
        console.log('🔑 Session user:', currentSession?.user);
        console.log('🔑 Session access token present:', !!currentSession?.access_token);
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }

        if (isMounted) {
          console.log('🔄 Setting session and user state...');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            console.log('👤 User found, fetching profile...');
            const profileData = await fetchUserProfile(currentSession.user.id);
            if (isMounted && profileData) {
              console.log('✅ Profile set successfully');
              setProfile(profileData);
            }
          } else {
            console.log('⚠️ No user in session');
          }
          
          console.log('✅ Auth initialization complete');
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Configurer le listener pour les changements d'état
    console.log('👂 Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('🔔 === AUTH STATE CHANGE ===');
        console.log('🔔 Auth event:', event);
        console.log('🔔 New session:', newSession);
        console.log('🔔 New user:', newSession?.user);
        console.log('🔔 Access token present:', !!newSession?.access_token);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          console.log('👤 User authenticated, fetching profile...');
          // Utiliser setTimeout pour éviter les conflits avec les listeners
          setTimeout(async () => {
            if (isMounted) {
              const profileData = await fetchUserProfile(newSession.user.id);
              if (isMounted && profileData) {
                console.log('✅ Profile updated successfully');
                setProfile(profileData);
              }
            }
          }, 100);
        } else {
          console.log('👤 User signed out, clearing profile');
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
      console.log('🧹 Cleaning up auth hook');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    console.log('📝 === SIGN UP ATTEMPT ===');
    console.log('📝 Email:', email);
    console.log('📝 User data:', userData);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
        }
      });
      
      console.log('📝 SignUp result:', { error });
      
      if (error) {
        console.error('❌ SignUp error:', error);
      } else {
        console.log('✅ SignUp successful');
      }
      
      return { error };
    } catch (error) {
      console.error('💥 SignUp exception:', error);
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 === SIGN IN ATTEMPT ===');
    console.log('🔐 Email:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('🔐 SignIn result:', { error });
      
      if (error) {
        console.error('❌ SignIn error:', error);
      } else {
        console.log('✅ SignIn successful');
      }
      
      return { error };
    } catch (error) {
      console.error('💥 SignIn exception:', error);
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 === SIGN OUT ATTEMPT ===');
    
    try {
      await supabase.auth.signOut();
      console.log('✅ SignOut successful');
    } catch (error) {
      console.error('💥 SignOut exception:', error);
    }
  }, []);

  // Debug final state
  useEffect(() => {
    console.log('📊 === AUTH STATE SUMMARY ===');
    console.log('📊 Loading:', loading);
    console.log('📊 User:', user?.id);
    console.log('📊 User email:', user?.email);
    console.log('📊 Profile:', profile?.id);
    console.log('📊 Profile role:', profile?.role);
    console.log('📊 Session present:', !!session);
    console.log('📊 Access token present:', !!session?.access_token);
  }, [loading, user, profile, session]);

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
