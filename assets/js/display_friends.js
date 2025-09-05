function renderFriends(friends, sort = "longest-overdue") {
	const container = document.getElementById("friend-list");
	container.innerHTML = ""; // clear previous entries

	const today = new Date();

	// --- sorting logic ---
	friends = [...friends]; // copy so we don't mutate original
	friends.sort((a, b) => {
		// pinned friends always first
		if (a.pinned && !b.pinned) return -1;
		if (!a.pinned && b.pinned) return 1;

		// helper: get last date met
		const lastDateA = a["dates-met"].length > 0 ? new Date(Math.max(...a["dates-met"].map((d) => new Date(d)))) : null;
		const lastDateB = b["dates-met"].length > 0 ? new Date(Math.max(...b["dates-met"].map((d) => new Date(d)))) : null;

		// alphabetical always first
		if (sort === "alphabetical") return a.name.localeCompare(b.name);

		// put friends with no hangouts at the bottom
		if (!lastDateA && lastDateB) return 1;
		if (lastDateA && !lastDateB) return -1;
		if (!lastDateA && !lastDateB) return a.name.localeCompare(b.name); // tie-break

		// days since last hangout
		const today = new Date();
		const daysAgoA = Math.floor((today - lastDateA) / (1000 * 60 * 60 * 24));
		const daysAgoB = Math.floor((today - lastDateB) / (1000 * 60 * 60 * 24));

		if (sort === "longest-overdue" || sort === "most-time-left") {
			const overdueA = daysAgoA - a["hangout-goal"];
			const overdueB = daysAgoB - b["hangout-goal"];

			const isGoalZeroA = a["hangout-goal"] === 0;
			const isGoalZeroB = b["hangout-goal"] === 0;

			if (sort === "longest-overdue") {
				if (isGoalZeroA && !isGoalZeroB) return 1;
				if (!isGoalZeroA && isGoalZeroB) return -1;
				if (!isGoalZeroA && !isGoalZeroB) {
					if (overdueB - overdueA !== 0) return overdueB - overdueA;
				}
				if (lastDateA - lastDateB !== 0) return lastDateA - lastDateB;
				return a.name.localeCompare(b.name);
			} else {
				// most-time-left
				if (isGoalZeroA && !isGoalZeroB) return -1;
				if (!isGoalZeroA && isGoalZeroB) return 1;
				const leftA = -overdueA;
				const leftB = -overdueB;
				if (leftB - leftA !== 0) return leftB - leftA;
				if (lastDateB - lastDateA !== 0) return lastDateB - lastDateA;
				return a.name.localeCompare(b.name);
			}
		} else {
			// latest / oldest
			const cmp = sort === "latest" ? lastDateB - lastDateA : lastDateA - lastDateB;
			if (cmp !== 0) return cmp;
			return a.name.localeCompare(b.name);
		}
	});

	// --- render loop ---
	friends.forEach((friend) => {
		const lastDate = friend["dates-met"].length > 0 ? new Date(Math.max(...friend["dates-met"].map((d) => new Date(d)))) : null;

		const daysAgo = lastDate ? Math.floor((today - lastDate) / (1000 * 60 * 60 * 24)) : null;
		const overdueDays = daysAgo !== null ? daysAgo - friend["hangout-goal"] : null;

		const friendDiv = document.createElement("div");
		friendDiv.className = "friend-container";

		// --- pin icon ---
		if (friend.pinned) {
			const pinDiv = document.createElement("div");
			pinDiv.className = "pin-icon";
			friendDiv.appendChild(pinDiv);
		}

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

		if (daysAgo !== null) {
			lastSeenSpan.textContent = `${daysAgo} days ago`;
		} else {
			lastSeenSpan.textContent = "no hangouts logged";
		}

		lastSeenDiv.appendChild(lastSeenSpan);

		if (friend["hangout-goal"] != 0 && overdueDays !== null) {
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
		}

		infoDiv.appendChild(nameDiv);
		infoDiv.appendChild(lastSeenDiv);

		friendDiv.appendChild(iconDiv);
		friendDiv.appendChild(infoDiv);

		container.appendChild(friendDiv);
	});
}

function open_sort_menu() {
	// remove if already exists
	const existingMenu = document.getElementById("sort-menu");
	if (existingMenu) existingMenu.remove();

	// create menu container
	const menu = document.createElement("div");
	menu.id = "sort-menu";
	menu.innerHTML = `
		<div class="back-icon"></div>
		<div class="menu-title">Sort Friends</div>
		<div class="option" data-sort="longest-overdue">
			<div class="radio ${currentSort === "longest-overdue" ? "active" : ""}"></div>
			<div class="option-label">Longest Overdue</div>
		</div>
		<div class="option" data-sort="most-time-left">
			<div class="radio ${currentSort === "most-time-left" ? "active" : ""}"></div>
			<div class="option-label">Most Time Left</div>
		</div>
		<div class="option" data-sort="alphabetical">
			<div class="radio ${currentSort === "alphabetical" ? "active" : ""}"></div>
			<div class="option-label">Alphabetical</div>
		</div>
		<div class="option" data-sort="latest">
			<div class="radio ${currentSort === "latest" ? "active" : ""}"></div>
			<div class="option-label">Most Recently Seen</div>
		</div>
		<div class="option" data-sort="oldest">
			<div class="radio ${currentSort === "oldest" ? "active" : ""}"></div>
			<div class="option-label">Least Recently Seen</div>
		</div>
	`;

	// append to body
	document.body.appendChild(menu);

	// add click listeners
	menu.querySelectorAll(".option").forEach((option) => {
		option.addEventListener("click", () => {
			const sortType = option.getAttribute("data-sort");
			currentSort = sortType; // update global state
			localStorage.setItem("preferredSort", sortType); // save preference

			// fetch and render
			fetch("assets/json/friends.json")
				.then((response) => response.json())
				.then((data) => {
					friends = data;
					renderFriends(friends, sortType);
				});

			// remove menu
			menu.remove();
		});
	});

	// add click listener for back-icon to just close menu
	const backIcon = menu.querySelector(".back-icon");
	if (backIcon) {
		backIcon.addEventListener("click", () => {
			menu.remove();
		});
	}
}

let currentSort = localStorage.getItem("preferredSort") || "longest-overdue";

fetch("assets/json/friends.json")
	.then((response) => response.json())
	.then((data) => {
		friends = data;
		renderFriends(friends, currentSort);
	});
