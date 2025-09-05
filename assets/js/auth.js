// assets/js/auth.js
import { supabase } from "./supabaseClient.js";

// Return the logged-in user (or null)
export async function currentUser() {
	const { data } = await supabase.auth.getUser();
	return data?.user ?? null;
}

// Call on pages that must be protected; redirects to /login.html if not logged in
export async function requireAuth(redirectTo = "/login.html") {
	const user = await currentUser();
	if (!user) {
		window.location.href = redirectTo;
		return null;
	}
	return user;
}

// Optional: set up global auth listener (e.g., to clear UI or localStorage on sign out)
export function onAuthChange(cb) {
	const { data } = supabase.auth.onAuthStateChange((event, session) => {
		cb(event, session);
	});
	return data?.subscription;
}
