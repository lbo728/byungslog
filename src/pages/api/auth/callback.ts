export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "src/lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");

  if (!authCode) {
    console.error("No auth code found in callback");
    return new Response("No code provided", { status: 400 });
  }

  console.log("Auth code received:", authCode);

  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  console.log("Session created, redirecting to dashboard");

  const { access_token, refresh_token } = data.session;

  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });

  return redirect("/dashboard");
};
