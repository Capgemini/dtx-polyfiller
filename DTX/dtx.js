// Forcefully shows invisible buttons
function fixMissingButtons() {
	document.querySelectorAll('input[type="button"]')
	.forEach(button => {
		button.style.visibility = "visible";
	});
}


// Corrects input elements to use modern change handlers
function fixInputEventHandlers() {
	document.querySelectorAll('input')
	.forEach(input => {
		let propertyChange = input.getAttribute("onpropertychange");

		try {
			input.addEventListener('change', propertyChange);
		} catch(e) {
			// Suppress errors
		}

		input.setAttribute('onchange', propertyChange);      
	});
}


// Adds toggle-able checkbox selection of work days to auto-fill with 7.5 hours
function checkboxMode() {
	let inputs = [...document.querySelectorAll("#calDates_tabCalendar > tbody input")];
	if (inputs.length > 0) {
		let checkboxes = inputs.map(input => {
			let checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.style.display = "none";
			if(input.style["background-color"] === "rgb(225, 225, 225)") {
				checkbox.style.opacity = 0.6;
			}
			checkbox.style.width = "25px";
			checkbox.style.height = "25px";
			if (Number(input.value) === 7.5) {
				checkbox.checked = true;
			}
			checkbox.onchange = event => input.value = event.target.checked ? "7.5" : "";
			input.insertAdjacentElement('afterend', checkbox);
			return checkbox;
		});
		let buttonRow = document.querySelector("#SubMenuUC1_SubMenu_div1 > table > tbody > tr");
		let button = document.createElement("td");
		button.innerHTML = "<button>Checkbox Mode</button>";
		buttonRow.appendChild(button);
		let checkboxMode = false;
		button.addEventListener("click", event => {
			event.preventDefault();
			event.stopPropagation();
			checkboxMode = !checkboxMode;
			button.querySelector("button").innerText = checkboxMode ? "Input mode" : "Checkbox Mode";
			checkboxes.forEach(combo => combo.style.display = checkboxMode ? "block" : "none");
			inputs.forEach(combo => combo.style.display = checkboxMode ? "none" : "block");
		})
	}
}

// Adds hotkeys:
//  CTRL+S to save changes
//  Escape to go home
function injectShortcutKeys() {
	document.addEventListener('keydown', function(event) {
		const keySPressed = (event.keyCode === 83 || event.keyCode === 115); // Check if code is for 's' or 'S'
		if (event.ctrlKey && keySPressed) {
			event.preventDefault(); // Prevent browser's save dialog showing
			if (saveFromIcon) saveFromIcon(); else myPage.Save(); // Call DTX save button click function
		} else if (event.key === "Escape") {
			event.preventDefault(); // Prevent escape key stopping document reloading
			const homeURL = window.location.origin + "/DTX.NET/Summary.aspx";
			if (window.location.href !== homeURL) window.location.href = "Summary.aspx"; // Don't run when already home
		}
	});
}




fixMissingButtons();
fixInputEventHandlers();
checkboxMode();
injectShortcutKeys();

console.log("Loading finished");