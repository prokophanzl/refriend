function renderFriends(friends, sort = "latest") {
	const container = document.getElementById("friend-list");
	container.innerHTML = ""; // clear previous entries

	const today = new Date();

	// --- sorting logic ---
	friends = [...friends]; // copy so we don't mutate original
	if (sort === "alphabetical") {
		friends.sort((a, b) => a.name.localeCompare(b.name));
	} else if (sort === "longest-overdue" || sort === "most-time-left") {
		friends.sort((a, b) => {
			const lastDateA = new Date(Math.max(...a["dates-met"].map((d) => new Date(d))));
			const lastDateB = new Date(Math.max(...b["dates-met"].map((d) => new Date(d))));

			const daysAgoA = Math.floor((today - lastDateA) / (1000 * 60 * 60 * 24));
			const daysAgoB = Math.floor((today - lastDateB) / (1000 * 60 * 60 * 24));

			const overdueA = daysAgoA - a["hangout-goal"];
			const overdueB = daysAgoB - b["hangout-goal"];

			if (sort === "longest-overdue") {
				// larger overdue first
				return overdueB - overdueA;
			} else {
				// most days left first
				const leftA = -overdueA; // positive if still time left
				const leftB = -overdueB;
				return leftB - leftA;
			}
		});
	} else {
		// both "latest" and "oldest" need lastDate
		friends.sort((a, b) => {
			const lastDateA = new Date(Math.max(...a["dates-met"].map((d) => new Date(d))));
			const lastDateB = new Date(Math.max(...b["dates-met"].map((d) => new Date(d))));
			return sort === "latest"
				? lastDateB - lastDateA // newest first
				: lastDateA - lastDateB; // oldest first
		});
	}

	// --- render loop ---
	friends.forEach((friend) => {
		// get last date met (latest date in array)
		const lastDate = new Date(Math.max(...friend["dates-met"].map((d) => new Date(d))));

		// calculate days since last hangout
		const diffMs = today - lastDate;
		const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		// check if overdue
		const overdueDays = daysAgo - friend["hangout-goal"];

		// build DOM structure
		const friendDiv = document.createElement("div");
		friendDiv.className = "friend-container";

		const iconDiv = document.createElement("div");
		iconDiv.className = "friend-icon";

		const infoDiv = document.createElement("div");
		infoDiv.className = "friend-info";

		const nameDiv = document.createElement("div");
		nameDiv.className = "friend-name-container";
		nameDiv.textContent = friend.name;

		const lastSeenDiv = document.createElement("div");
		lastSeenDiv.className = "last-seen-container";

		const lastSeenSpan = document.createElement("span");
		lastSeenSpan.className = "last-seen";
		lastSeenSpan.textContent = `${daysAgo} days ago`;

		lastSeenDiv.appendChild(lastSeenSpan);

		// show time left/overdue info
		const timeLeftSpan = document.createElement("span");

		if (overdueDays === 0) {
			timeLeftSpan.className = "due-today";
			timeLeftSpan.textContent = " (due today)";
		} else if (overdueDays === -1) {
			timeLeftSpan.className = "time-left";
			timeLeftSpan.textContent = " (1 day left)";
		} else if (overdueDays === 1) {
			timeLeftSpan.className = "overdue";
			timeLeftSpan.textContent = " (1 day overdue)";
		} else if (overdueDays < 0) {
			timeLeftSpan.className = "time-left";
			timeLeftSpan.textContent = ` (${-overdueDays} days left)`;
		} else if (overdueDays > 1) {
			timeLeftSpan.className = "overdue";
			timeLeftSpan.textContent = ` (${overdueDays} days overdue)`;
		}

		lastSeenDiv.appendChild(timeLeftSpan);

		infoDiv.appendChild(nameDiv);
		infoDiv.appendChild(lastSeenDiv);

		friendDiv.appendChild(iconDiv);
		friendDiv.appendChild(infoDiv);

		container.appendChild(friendDiv);
	});
}

fetch("assets/json/friends.json")
	.then((response) => response.json())
	.then((data) => {
		friends = data;
		renderFriends(friends, "longest-overdue");
	});
