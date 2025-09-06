// account_menu.js
async function open_account_menu() {
	// remove if menu already exists
	const existingMenu = document.getElementById("account-menu");
	if (existingMenu) existingMenu.remove();

	// get user & profile
	const { data: userData } = await window.supabase.auth.getUser();
	const user = userData?.user ?? null;
	let profile = null;
	if (user) {
		const { data, error } = await window.supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();
		profile = data ?? null;
	}

	const menu = document.createElement("div");
	menu.id = "account-menu";
	menu.innerHTML = `
    <div class="back-icon"></div>
    <div class="menu-title">
      <div class="menu-name">${profile?.full_name ?? user?.email ?? "Unknown"}</div>
      <div class="menu-subtitle">${user?.email ?? ""}</div>
    </div>
    <div class="option" onclick="window.location.href = 'change_name.html'">
      <div class="option-label">Change Name</div>
    </div>
    <div class="option" id="change-password-option">
      <div class="option-label">Change Password</div>
    </div>
    <div class="option" id="delete-account-option">
      <div class="option-label">Delete Account</div>
    </div>
    <div class="option" id="sign-out-option">
      <div class="option-label">Sign Out</div>
    </div>
  `;

	document.body.appendChild(menu);

	const backIcon = menu.querySelector(".back-icon");
	if (backIcon) backIcon.addEventListener("click", () => menu.remove());

	// sign out behaviour
	menu.querySelector("#sign-out-option").addEventListener("click", async () => {
		await window.supabase.auth.signOut();
		// clear any local data you used
		localStorage.removeItem("preferredSort");
		window.location.href = "/login.html";
	});
}

document.getElementById("account-button").addEventListener("click", open_account_menu);
