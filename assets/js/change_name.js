document.addEventListener("DOMContentLoaded", async () => {
	const { data } = await window.supabase.auth.getUser();
	const user = data?.user;
	if (!user) return (window.location.href = "/login.html");

	const input = document.querySelector('.input-container.friend-name input[type="text"]');
	const changeBtn = document.querySelector(".button-container button:last-child");
	const cancelBtn = document.querySelector(".button-container button:first-child");

	// load existing
	const { data: profile } = await window.supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
	if (profile) input.value = profile.full_name ?? "";

	cancelBtn.addEventListener("click", () => (window.location.href = "/"));

	changeBtn.addEventListener("click", async () => {
		const name = input.value.trim();
		if (!name) return alert("Please enter a name");

		// upsert profile
		const { error } = await window.supabase.from("profiles").upsert({ id: user.id, full_name: name }).select();
		if (error) {
			console.error(error);
			return alert("Failed to update name");
		}
		window.location.href = "/";
	});
});
