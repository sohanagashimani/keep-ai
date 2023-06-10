"use client";
import { Auth } from "@supabase/auth-ui-react";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import When from "@/components/When/When";
import Home from "@/components/Home/Home";
import { isEmpty } from "ramda";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/utils/supabase";
import Spinner from "@/components/Spinner/Spinner";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const {
          user = {},
          user: { user_metadata = {} },
        } = session;
        setUser(isEmpty(user_metadata) ? user : user_metadata);
      }
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const {
          user = {},
          user: { user_metadata = {} },
        } = session;
        setUser(isEmpty(user_metadata) ? user : user_metadata);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer transition={Zoom} />
      <When isTrue={loading}>
        <div className="flex flex-row items-center h-screen justify-center">
          <div className="flex flex-col">
            <Spinner spinning={loading} />
          </div>
        </div>
      </When>
      <When isTrue={!loading && !session}>
        <div className="flex justify-center items-center flex-grow">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={["google"]}
          />
        </div>
      </When>
      <When isTrue={!loading && session}>
        <Home
          {...{
            user,
            setSession,
            setUser,
          }}
        />
      </When>
    </div>
  );
}
