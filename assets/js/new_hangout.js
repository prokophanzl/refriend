document.addEventListener("DOMContentLoaded", async () => {
	const { data: userData } = await window.supabase.auth.getUser();
	const user = userData?.user;
	if (!user) return (window.location.href = "/login.html");

	const select = document.getElementById("friend-select");
	const dateInput = document.querySelector('.input-container.last-met input[type="date"]');
	const addBtn = document.querySelector(".button-container button:last-child");
	const cancelBtn = document.querySelector(".button-container button:first-child");

	// fetch friends
	const { data: friends, error } = await window.supabase
		.from("friends")
		.select("id,name")
		.eq("user_id", user.id)
		.order("name", { ascending: true });

	if (error) {
		console.error(error);
		return (select.innerHTML = '<option value="">Error loading friends</option>');
	}

	friends.forEach((f) => {
		const opt = document.createElement("option");
		opt.value = f.id;
		opt.textContent = f.name;
		select.appendChild(opt);
	});

	cancelBtn.addEventListener("click", () => (window.location.href = "/"));

	addBtn.addEventListener("click", async (ev) => {
		ev.preventDefault();
		const friendId = select.value;
		const date = dateInput.value;
		if (!friendId || !date) return alert("Pick friend and date");

		const { error: insErr } = await window.supabase.from("hangouts").insert([{ user_id: user.id, friend_id: friendId, date }]);

		if (insErr) {
			console.error(insErr);
			return alert("Failed to log hangout");
		}

		window.location.href = `/`;
	});
});
