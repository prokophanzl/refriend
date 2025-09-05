function open_account_menu() {
	// remove if menu already exists
	const existingMenu = document.getElementById("account-menu");
	if (existingMenu) existingMenu.remove();

	// create menu container
	const menu = document.createElement("div");
	menu.id = "account-menu";
	menu.innerHTML = `
		<div class="back-icon"></div>
		<div class="menu-title">
			<div class="menu-name">Ash Hanžl</div>
			<div class="menu-subtitle">ashhanzl03@gmail.com</div>
		</div>
		<div class="option" onclick="window.location.href = 'change_name.html'">
			<div class="option-label">Change Name</div>
		</div>
		<div class="option" id="sign-out-option">
			<div class="option-label">Sign Out</div>
		</div>
	`;

	// append to body
	document.body.appendChild(menu);

	// back-icon closes menu
	const backIcon = menu.querySelector(".back-icon");
	if (backIcon) {
		backIcon.addEventListener("click", () => {
			menu.remove();
		});
	}
}
