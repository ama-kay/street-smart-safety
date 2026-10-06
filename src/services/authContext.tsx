/* eslint-disable prettier/prettier */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountDisabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountDisabled, setAccountDisabled] =
    useState(false);

  /*
   * =========================================================
   * Check whether the current user's account is disabled
   * =========================================================
   */

  async function checkAccountStatus(
    currentUser: User | null,
  ): Promise<boolean> {
    if (!currentUser) {
      setAccountDisabled(false);
      return false;
    }

    const { data: profile, error } = await supabase
      .from("user_profile")
      .select("account_disabled")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to check account status:",
        error,
      );

      /*
       * If the account status cannot be checked, don't
       * automatically disable the user. The route guards
       * will perform another check when accessing a route.
       */
      return false;
    }

    const disabled = profile?.account_disabled === true;

    setAccountDisabled(disabled);

    return disabled;
  }

  /*
   * =========================================================
   * Handle a Supabase session
   * =========================================================
   */

  async function handleSession(
    currentSession: Session | null,
  ) {
    if (!currentSession?.user) {
      setSession(null);
      setUser(null);
      setAccountDisabled(false);
      return;
    }

    const currentUser = currentSession.user;

    const disabled = await checkAccountStatus(
      currentUser,
    );

    if (disabled) {
      console.warn(
        "Disabled account detected. Signing user out.",
      );

      /*
       * Clear the application's authentication state
       * immediately.
       */

      setSession(null);
      setUser(null);

      /*
       * Sign the user out of Supabase.
       */

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error(
          "Failed to sign out disabled user:",
          error,
        );
      }

      return;
    }

    setSession(currentSession);
    setUser(currentUser);
  }

  useEffect(() => {
    let mounted = true;

    /*
     * =======================================================
     * Get current session when application starts
     * =======================================================
     */

    async function loadSession() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Failed to load session:",
            error,
          );

          if (mounted) {
            setSession(null);
            setUser(null);
          }

          return;
        }

        console.log(
          "SESSION ON APP START:",
          currentSession,
        );

        if (mounted) {
          await handleSession(currentSession);
        }
      } catch (error) {
        console.error(
          "Unexpected session loading error:",
          error,
        );

        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    /*
     * =======================================================
     * Listen for authentication changes
     * =======================================================
     */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        /*
         * Don't block the Supabase auth callback.
         * Run our account-status check asynchronously.
         */

        void handleSession(currentSession);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        accountDisabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}