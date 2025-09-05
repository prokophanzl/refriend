document.addEventListener("DOMContentLoaded", async () => {
	const userRes = await window.supabase.auth.getUser();
	const user = userRes?.data?.user;
	if (!user) {
		window.location.href = "/login.html";
		return;
	}

	const nameInput = document.querySelector('.input-container.friend-name input[type="text"]');
	// const fileInput = document.querySelector('.input-container.friend-name input[type="file"]');
	const goalInput = document.querySelector('.input-container.hangout-goal input[type="number"]');
	const dateInput = document.querySelector('.input-container.last-met input[type="date"]');
	const addBtn = document.querySelector(".button-container button:last-child");
	const cancelBtn = document.querySelector(".button-container button:first-child");

	cancelBtn.addEventListener("click", () => (window.location.href = "/"));

	addBtn.addEventListener("click", async (e) => {
		e.preventDefault();
		const name = nameInput.value.trim();
		if (!name) return alert("Please enter a name");

		// let avatar_url = null;
		// const file = fileInput.files[0];
		// if (file) {
		// 	const path = `${user.id}/${Date.now()}_${file.name}`;
		// 	const { data, error } = await window.supabase.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: false });

		// 	if (error) {
		// 		console.error("Upload error", error);
		// 		return alert("Failed to upload avatar");
		// 	}

		// 	const { data: publicData } = window.supabase.storage.from("avatars").getPublicUrl(path);
		// 	avatar_url = publicData.publicUrl;
		// }

		const hangout_goal = parseInt(goalInput.value || "0", 10);
		const lastMet = dateInput.value || null;

		// insert friend
		const { data: friendData, error: friendError } = await window.supabase
			.from("friends")
			.insert([
				{
					user_id: user.id,
					name,
					hangout_goal,
					pinned: false,
					avatar_url: null,
					tags: [],
				},
			])
			.select()
			.single();

		if (friendError) {
			console.error("Insert friend error", friendError);
			return alert("Failed to add friend");
		}

		// if lastMet provided, log a hangout
		if (lastMet) {
			const { error: hangErr } = await window.supabase.from("hangouts").insert([
				{
					user_id: user.id,
					friend_id: friendData.id,
					date: lastMet,
				},
			]);
			if (hangErr) console.warn("Could not log initial hangout", hangErr);
		}

		window.location.href = "/";
	});
});
