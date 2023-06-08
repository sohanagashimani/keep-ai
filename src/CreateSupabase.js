import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const createSupabase = (headers, cookies) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
  const supabase = createRouteHandlerClient(
    {
      cookies,
      headers,
    },
    {
      supabaseUrl,
      supabaseKey,
    }
  );
  return supabase;
};

export default createSupabase;
