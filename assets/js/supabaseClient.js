// assets/js/supabaseClient.js
// -> Replace the placeholder strings with your real values, or
//    set them through your deploy env and a build step if you prefer.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://qzffawjajafyhmwmhjix.supabase.co"; // <-- replace
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6ZmZhd2phamFmeWhtd21oaml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODA3MDYsImV4cCI6MjA3MjY1NjcwNn0.ExU7G-Iefe10qzGYlNmByYC7OJVXlS2POFOLJpymU6A"; // <-- replace

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// expose for non-module scripts
window.supabase = supabase;
