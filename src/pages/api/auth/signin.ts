export const prerender = false;

import type { APIRoute } from "astro";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "src/lib/supabase";

// export const GET: APIRoute = async ({ request, redirect }) => {
//   const url = new URL(request.url);
//   const code = url.searchParams.get("code");
//   const provider = url.searchParams.get("provider");

//   if (code) {
//     return redirect(`/api/auth/callback?code=${code}`);
//   }

//   return new Response(null, { status: 400 });
// };

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const provider = formData.get("provider")?.toString();

  const validProviders = ["google", "github", "discord"];

  if (provider && validProviders.includes(provider)) {
    console.log("OAuth provider detected:", provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: "http://localhost:4321/api/auth/callback",
      },
    });

    if (error) {
      console.error("OAuth sign-in error:", error.message);
      return new Response(error.message, { status: 500 });
    }

    console.log("Redirecting to:", data.url);
    return redirect(data.url);
  }

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });
  return redirect("/dashboard");
};
