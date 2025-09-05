document.addEventListener("DOMContentLoaded", async () => {
	const url = new URL(window.location.href);
	const friendId = url.searchParams.get("id");
	if (!friendId) return (document.querySelector(".friend-profile").textContent = "Missing friend id");

	const { data: userData } = await window.supabase.auth.getUser();
	const user = userData?.user;
	if (!user) {
		window.location.href = "/login.html";
		return;
	}

	// fetch friend (ensure it belongs to current user)
	const { data: friend, error: fErr } = await window.supabase.from("friends").select("*").eq("id", friendId).eq("user_id", user.id).maybeSingle();

	if (fErr || !friend) {
		console.error(fErr);
		return (document.querySelector(".friend-profile").textContent = "Friend not found");
	}

	// fetch hangouts
	const { data: hangouts } = await window.supabase.from("hangouts").select("*").eq("friend_id", friendId).order("date", { ascending: false });

	// populate DOM (assumes your friend.html markup exists)
	const profileEl = document.querySelector(".friend-profile");
	profileEl.innerHTML = `
    <div class="friend-header">
      <div class="friend-photo" style="background-image: url('${
			friend.avatar_url ?? ""
		}'); background-size: cover; background-position:center;"></div>
      <div class="friend-name-container">
        <h1>${friend.name}</h1>
        <div class="edit-icon"></div>
      </div>
    </div>
    <hr />
    <div class="friend-info">
      <div class="pin-friend">
        <h2>Pin Friend</h2>
        <div class="pin-icon icon ${friend.pinned ? "active" : ""}"></div>
      </div>
      <hr class="light" />
      <div class="last-seen">
        <h2>Last Hangout</h2>
        <p>${hangouts && hangouts.length ? hangouts[0].date : "No hangouts logged"}</p>
        <div class="plus-icon icon"></div>
      </div>
      <hr class="light" />
      <div class="hangout-goal">
        <h2>Hangout Goal</h2>
        <p>Every ${friend.hangout_goal || 0} days</p>
        <div class="edit-icon icon"></div>
      </div>
      <hr class="light" />
      <div class="tags">
        <h2>Tags</h2>
        <div class="tag-container">${(friend.tags || []).map((t) => `<span class="tag">${t}</span>`).join(" ")}</div>
        <div class="edit-icon icon"></div>
      </div>
      <hr class="light" />
      <div class="past-hangouts">
        <h2>All Hangouts</h2>
        <div class="hangout-container">
          ${(hangouts || [])
				.map(
					(h, i, arr) => `
    <div class="hangout">
      <div class="hangout-date">${h.date}</div>
      <div class="delete-icon icon" data-id="${h.id}"></div>
    </div>
    <hr class="${i === arr.length - 1 ? "light" : "mini"}" />
  `
				)
				.join("")}
        </div>

	<div class="remove-friend">
		<div class="delete-icon icon"></div>
		<h2>Remove Friend</h2>
	</div>
      </div>
    </div>
    <hr />
  `;

	// wire up delete icons
	profileEl.querySelectorAll(".delete-icon").forEach((btn) => {
		btn.addEventListener("click", async (ev) => {
			const id = ev.currentTarget.dataset.id;
			if (!confirm("Delete hangout?")) return;
			const { error } = await window.supabase.from("hangouts").delete().eq("id", id);
			if (error) return alert("Failed to delete");
			location.reload();
		});
	});

	// pin toggle (example)
	const pinIcon = profileEl.querySelector(".pin-icon");
	if (pinIcon) {
		pinIcon.addEventListener("click", async () => {
			const { error } = await window.supabase.from("friends").update({ pinned: !friend.pinned }).eq("id", friend.id);
			if (error) return alert("Failed to toggle pin");
			location.reload();
		});
	}
});
