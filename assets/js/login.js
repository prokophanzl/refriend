document.addEventListener("DOMContentLoaded", () => {
	const signInBtn = document.getElementById("sign-in");
	const signUpBtn = document.getElementById("sign-up");
	const emailEl = document.getElementById("email");
	const pwdEl = document.getElementById("password");
	const msg = document.getElementById("auth-message");

	signUpBtn.addEventListener("click", async () => {
		msg.textContent = "Creating account...";
		const email = emailEl.value;
		const password = pwdEl.value;
		const { data, error } = await window.supabase.auth.signUp({ email, password });
		if (error) {
			msg.textContent = error.message;
		} else {
			// create profile row (upsert) right away so we have a profile
			const userId = data.user?.id;
			if (userId) {
				await window.supabase.from("profiles").upsert({ id: userId, full_name: null });
			}
			msg.textContent = "Check your email to confirm signup (if email confirmation is required).";
		}
	});

	signInBtn.addEventListener("click", async () => {
		msg.textContent = "Signing in...";
		const email = emailEl.value;
		const password = pwdEl.value;
		const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
		if (error) {
			msg.textContent = error.message;
		} else {
			// redirect to main app
			window.location.href = "/";
		}
	});
});
