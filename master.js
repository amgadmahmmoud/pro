// Filter menu items by the category selected above the menu.
const filterButtons = document.querySelectorAll(".filter-button");
const menuItems = document.querySelectorAll(".dish");
const orderSummary = document.querySelector("#order-summary");
const orderItems = document.querySelector("#order-items");
const orderCount = document.querySelector("#order-count");
const orderTotal = document.querySelector("#order-total");
const order = new Map();

filterButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const selectedCategory = button.dataset.filter;

		filterButtons.forEach((item) => {
			const isSelected = item === button;
			item.classList.toggle("is-active", isSelected);
			item.setAttribute("aria-pressed", String(isSelected));
		});

		menuItems.forEach((dish) => {
			dish.hidden = selectedCategory !== "all" && dish.dataset.category !== selectedCategory;
		});
	});
});

function renderOrder() {
	orderItems.replaceChildren();
	let itemCount = 0;
	let total = 0;

	menuItems.forEach((dish) => {
		dish.querySelector(".add-to-order").textContent = "Add to order";
	});

	order.forEach((quantity, dish) => {
		const name = dish.querySelector("h3").textContent;
		const price = Number(dish.dataset.price);
		const item = document.createElement("li");
		const itemName = document.createElement("span");
		const controls = document.createElement("div");
		const decreaseButton = document.createElement("button");
		const quantityLabel = document.createElement("span");
		const increaseButton = document.createElement("button");

		item.className = "order-item";
		itemName.className = "order-item-name";
		itemName.textContent = name;
		controls.className = "quantity-controls";
		decreaseButton.type = "button";
		decreaseButton.className = "quantity-button";
		decreaseButton.textContent = "−";
		decreaseButton.setAttribute("aria-label", `Remove one ${name}`);
		decreaseButton.addEventListener("click", () => updateOrder(dish, -1));
		quantityLabel.textContent = String(quantity);
		quantityLabel.setAttribute("aria-label", `Quantity: ${quantity}`);
		increaseButton.type = "button";
		increaseButton.className = "quantity-button";
		increaseButton.textContent = "+";
		increaseButton.setAttribute("aria-label", `Add one ${name}`);
		increaseButton.addEventListener("click", () => updateOrder(dish, 1));

		controls.append(decreaseButton, quantityLabel, increaseButton);
		item.append(itemName, controls, document.createTextNode(`$${price * quantity}`));
		orderItems.append(item);
		itemCount += quantity;
		total += price * quantity;

		const addButton = dish.querySelector(".add-to-order");
		addButton.textContent = `Add to order${quantity > 0 ? ` · ${quantity}` : ""}`;
	});

	orderSummary.hidden = itemCount === 0;
	orderCount.textContent = itemCount ? `(${itemCount} ${itemCount === 1 ? "item" : "items"})` : "";
	orderTotal.textContent = `$${total}`;
}

function updateOrder(dish, change) {
	const nextQuantity = (order.get(dish) || 0) + change;
	if (nextQuantity > 0) {
		order.set(dish, nextQuantity);
	} else {
		order.delete(dish);
	}
	renderOrder();
}

menuItems.forEach((dish) => {
	dish.querySelector(".add-to-order").addEventListener("click", () => updateOrder(dish, 1));
});

document.querySelector("#clear-order").addEventListener("click", () => {
	order.clear();
	renderOrder();
});

// Keep the small-screen navigation button and menu in sync.
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function closeNavigation() {
	siteNav.classList.remove("is-open");
	navToggle.setAttribute("aria-expanded", "false");
	navToggle.setAttribute("aria-label", "Open navigation");
}

navToggle.addEventListener("click", () => {
	const isOpen = navToggle.getAttribute("aria-expanded") === "true";
	navToggle.setAttribute("aria-expanded", String(!isOpen));
	navToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
	siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.querySelectorAll("a").forEach((link) => {
	link.addEventListener("click", closeNavigation);
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
		closeNavigation();
		navToggle.focus();
	}
});

const themeToggle = document.querySelector(".theme-toggle");

const savedTheme = localStorage.getItem("casa-oliva-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.dataset.theme = savedTheme || preferredTheme;
themeToggle.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "dark"));
themeToggle.setAttribute("aria-label", `Switch to ${document.documentElement.dataset.theme === "dark" ? "light" : "dark"} mode`);
themeToggle.setAttribute("title", `Switch to ${document.documentElement.dataset.theme === "dark" ? "light" : "dark"} mode`);

themeToggle.addEventListener("click", () => {
	const isDark = document.documentElement.dataset.theme !== "dark";
	document.documentElement.dataset.theme = isDark ? "dark" : "light";
	themeToggle.setAttribute("aria-pressed", String(isDark));
	themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
	themeToggle.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} mode`);
	localStorage.setItem("casa-oliva-theme", isDark ? "dark" : "light");
});

// The static site sends reservation requests to FormSubmit for email delivery.
const reservationForm = document.querySelector("#reservation-form");
const dateInput = document.querySelector("#guest-date");
const formMessage = document.querySelector("#form-message");
const reservationSubmit = reservationForm.querySelector('button[type="submit"]');
const formSubmitEndpoint = "https://formsubmit.co/ajax/amgdmahmoud321@gmail.com";

function setMinimumDate() {
	const today = new Date();
	dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

let showingValidationMessage = false;

reservationForm.addEventListener("invalid", () => {
	const invalidFields = [...reservationForm.querySelectorAll(":invalid")];
	const invalidLabels = invalidFields.map((field) => {
		const label = [...reservationForm.querySelectorAll("label[for]")].find((item) => item.htmlFor === field.id);
		return label ? label.textContent.trim() : field.name;
	});

	formMessage.classList.add("is-error");
	if (invalidFields.some((field) => field.validity.typeMismatch)) {
		formMessage.textContent = "Please enter a valid email address.";
	} else {
		formMessage.textContent = `Please complete the required fields: ${[...new Set(invalidLabels)].join(", ")}.`;
	}
	showingValidationMessage = true;
}, true);

reservationForm.addEventListener("input", () => {
	if (showingValidationMessage) {
		formMessage.classList.remove("is-error");
		formMessage.textContent = "";
		showingValidationMessage = false;
	}
});

setMinimumDate();

reservationForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(reservationForm);
	const honeypot = formData.get("_honey");
	if (typeof honeypot === "string" && honeypot.trim()) {
		return;
	}

	const selection = [...order].map(([dish, quantity]) => `${dish.querySelector("h3").textContent} x${quantity}`).join(", ");
	formData.set("menu_selection", selection || "No menu items selected");
	const payload = Object.fromEntries(formData.entries());
	formMessage.classList.remove("is-error");
	formMessage.textContent = "Sending your request...";
	reservationSubmit.disabled = true;

	try {
		const response = await fetch(formSubmitEndpoint, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		const result = await response.json();
		if (!response.ok || !result.success) {
			throw new Error(result.message || "The email service could not accept your request.");
		}

		const guestName = String(formData.get("name")).trim();
		formMessage.textContent = `Thanks, ${guestName}! Your request was submitted. We'll contact you to confirm; this does not confirm your table.`;
		reservationForm.reset();
		order.clear();
		renderOrder();
		setMinimumDate();
	} catch (error) {
		formMessage.classList.add("is-error");
		formMessage.textContent = error instanceof Error
			? `We couldn't send your request: ${error.message} Please try again or call us.`
			: "We couldn't send your request. Please try again or call us.";
	} finally {
		reservationSubmit.disabled = false;
	}
});
