"use client";
import { Auth } from "@supabase/auth-ui-react";
import { useEffect, useState, Suspense } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Home from "@/components/Home/Home";
import { isEmpty } from "ramda";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/utils/supabase";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

// Separate auth component to handle authentication state
function AuthComponent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userMetadata = session.user?.user_metadata || {};
        const userToSet = isEmpty(userMetadata) ? session.user : userMetadata;
        setUser(userToSet);
      }
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const userMetadata = session.user?.user_metadata || {};
        const userToSet = isEmpty(userMetadata) ? session.user : userMetadata;
        setUser(userToSet);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-row items-center h-screen justify-center">
        <div className="flex flex-col">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center flex-grow">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={["google"]}
        />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex flex-row items-center h-screen justify-center">
        <div className="flex flex-col">
          <LoadingSpinner />
        </div>
      </div>
    }>
      <Home
        {...{
          user,
          setSession,
          setUser,
        }}
      />
    </Suspense>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer transition={Zoom} />
      <Suspense fallback={
        <div className="flex flex-row items-center h-screen justify-center">
          <div className="flex flex-col">
            <LoadingSpinner />
          </div>
        </div>
      }>
        <AuthComponent />
      </Suspense>
    </div>
  );
}
