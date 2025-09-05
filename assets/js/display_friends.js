// display_friends.js
// This script expects window.supabase to exist (loaded from supabaseClient.js)
let currentSort = localStorage.getItem("preferredSort") || "longest-overdue";

function daysBetween(dateString) {
	const d = new Date(dateString + "T00:00:00"); // safe date arithmetic
	const today = new Date();
	const diffMs = today - d;
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function createFriendRow(friend, lastDateStr, overdueDays) {
	const friendDiv = document.createElement("div");
	friendDiv.className = "friend-container";
	friendDiv.style.cursor = "pointer";
	friendDiv.onclick = () => {
		window.location.href = `friend.html?id=${friend.id}`;
	};

	if (friend.pinned) {
		const pinDiv = document.createElement("div");
		pinDiv.className = "pin-icon";
		friendDiv.appendChild(pinDiv);
	}

	const iconDiv = document.createElement("div");
	iconDiv.className = "friend-icon";
	if (friend.avatar_url) {
		iconDiv.style.backgroundImage = `url(${friend.avatar_url})`;
		iconDiv.style.backgroundSize = "cover";
		iconDiv.style.backgroundPosition = "center";
	}
	const infoDiv = document.createElement("div");
	infoDiv.className = "friend-info";

	const nameDiv = document.createElement("div");
	nameDiv.className = "friend-name-container";
	nameDiv.textContent = friend.name;

	const lastSeenDiv = document.createElement("div");
	lastSeenDiv.className = "last-seen-container";
	const lastSeenSpan = document.createElement("span");
	lastSeenSpan.className = "last-seen";

	if (lastDateStr) {
		const daysAgo = daysBetween(lastDateStr);
		lastSeenSpan.textContent = `${daysAgo} days ago`;
	} else {
		lastSeenSpan.textContent = "no hangouts logged";
	}
	lastSeenDiv.appendChild(lastSeenSpan);

	if (friend.hangout_goal && lastDateStr) {
		const daysAgo = daysBetween(lastDateStr);
		const overdue = daysAgo - (friend.hangout_goal || 0);
		const timeLeftSpan = document.createElement("span");

		if (overdue === 0) {
			timeLeftSpan.className = "due-today";
			timeLeftSpan.textContent = " (due today)";
		} else if (overdue === -1) {
			timeLeftSpan.className = "time-left";
			timeLeftSpan.textContent = " (1 day left)";
		} else if (overdue === 1) {
			timeLeftSpan.className = "overdue";
			timeLeftSpan.textContent = " (1 day overdue)";
		} else if (overdue < 0) {
			timeLeftSpan.className = "time-left";
			timeLeftSpan.textContent = ` (${Math.abs(overdue)} days left)`;
		} else {
			timeLeftSpan.className = "overdue";
			timeLeftSpan.textContent = ` (${overdue} days overdue)`;
		}
		lastSeenDiv.appendChild(timeLeftSpan);
	}

	infoDiv.appendChild(nameDiv);
	infoDiv.appendChild(lastSeenDiv);

	friendDiv.appendChild(iconDiv);
	friendDiv.appendChild(infoDiv);

	return friendDiv;
}

export async function loadAndRenderFriends(sort = null) {
	const sortToUse = sort || currentSort;
	const container = document.getElementById("friend-list");
	container.innerHTML = "";

	// ensure auth
	const { data: userData } = await window.supabase.auth.getUser();
	const user = userData?.user ?? null;
	if (!user) {
		window.location.href = "/login.html";
		return;
	}

	// fetch friends + hangouts in two queries (efficient)
	const { data: friends, error: fErr } = await window.supabase.from("friends").select("*").eq("user_id", user.id);

	if (fErr) {
		console.error("Error loading friends", fErr);
		container.textContent = "Error loading friends.";
		return;
	}

	const { data: hangouts, error: hErr } = await window.supabase
		.from("hangouts")
		.select("*")
		.eq("user_id", user.id)
		.order("date", { ascending: false });

	if (hErr) {
		console.error("Error loading hangouts", hErr);
	}

	const hangoutsByFriend = {};
	(hangouts || []).forEach((h) => {
		hangoutsByFriend[h.friend_id] = hangoutsByFriend[h.friend_id] || [];
		hangoutsByFriend[h.friend_id].push(h.date);
	});

	// augment friends with lastDate
	const augmented = (friends || []).map((f) => {
		const dates = hangoutsByFriend[f.id] || [];
		return {
			...f,
			dates_met: dates, // convenience
			last_met: dates.length > 0 ? dates[0] : null,
		};
	});

	// sorting (you can tweak or reuse your original logic)
	augmented.sort((a, b) => {
		// pinned first
		if (a.pinned && !b.pinned) return -1;
		if (!a.pinned && b.pinned) return 1;

		// no hangouts go bottom
		if (!a.last_met && b.last_met) return 1;
		if (a.last_met && !b.last_met) return -1;
		if (!a.last_met && !b.last_met) return a.name.localeCompare(b.name);

		// days since last hangout
		const daysA = daysBetween(a.last_met);
		const daysB = daysBetween(b.last_met);

		if (sortToUse === "alphabetical") return a.name.localeCompare(b.name);
		if (sortToUse === "latest") return daysA - daysB; // smaller daysAgo = newer => show first
		if (sortToUse === "oldest") return daysB - daysA;

		// overdue-related sorts
		const overdueA = daysA - (a.hangout_goal || 0);
		const overdueB = daysB - (b.hangout_goal || 0);

		if (sortToUse === "longest-overdue") {
			// put most overdue first
			if ((a.hangout_goal || 0) === 0 && (b.hangout_goal || 0) !== 0) return 1;
			if ((a.hangout_goal || 0) !== 0 && (b.hangout_goal || 0) === 0) return -1;
			if (overdueB !== overdueA) return overdueB - overdueA;
			return a.name.localeCompare(b.name);
		}

		if (sortToUse === "most-time-left") {
			if ((a.hangout_goal || 0) === 0 && (b.hangout_goal || 0) !== 0) return -1;
			if ((a.hangout_goal || 0) !== 0 && (b.hangout_goal || 0) === 0) return 1;
			const leftA = -overdueA,
				leftB = -overdueB;
			if (leftB - leftA !== 0) return leftB - leftA;
			return a.name.localeCompare(b.name);
		}

		return a.name.localeCompare(b.name);
	});

	// render
	augmented.forEach((friend) => {
		const lastDate = friend.last_met;
		const elem = createFriendRow(friend, lastDate);
		container.appendChild(elem);
	});
}

function open_sort_menu() {
	// remove if already exists
	const existingMenu = document.getElementById("sort-menu");
	if (existingMenu) existingMenu.remove();

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

	document.body.appendChild(menu);

	// click listeners for options
	menu.querySelectorAll(".option").forEach((option) => {
		option.addEventListener("click", () => {
			const sortType = option.getAttribute("data-sort");
			currentSort = sortType;
			localStorage.setItem("preferredSort", sortType);

			loadAndRenderFriends(sortType);
			menu.remove();
		});
	});

	// back-icon closes menu
	const backIcon = menu.querySelector(".back-icon");
	if (backIcon) {
		backIcon.addEventListener("click", () => menu.remove());
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadAndRenderFriends();

	const sortBtn = document.getElementById("sort-button");
	if (sortBtn) sortBtn.addEventListener("click", open_sort_menu);
});
