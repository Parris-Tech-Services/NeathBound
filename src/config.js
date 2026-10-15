// Public game client configuration. No database credential is shipped to the browser.
// Player sessions are secured by a generated 256-bit token, never a static API key.
export const config = {
  apiUrl: "https://neathbound-api.parris-neathaustralia.workers.dev",
  // Legacy Supabase settings retained for explicit ?api=supabase fallback.
  supabaseUrl: "https://ynrfskgfrgqxwjswtnka.supabase.co",
  publishableKey: "sb_publishable_Kf-_b_1FPPlPUGRTpOXyhQ_GO4Gdaqm"
};
