import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, // 세션을 쿠키에 저장하여 자동으로 로그인 상태 유지
      detectSessionInUrl: true, // 세션이 URL을 통해 감지되도록 설정
      autoRefreshToken: true, // 만료 시 자동으로 토큰 갱신
    },
  },
);
