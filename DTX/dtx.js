let setting_apiURL = "https://www.gov.uk/bank-holidays.json"; // URL to fetch up to date bank holidays



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
function loadSelectMode(defaultMode) {
	let inputs = [...document.querySelectorAll("#calDates_tabCalendar > tbody input")];

	let checkboxes = inputs.map(input => {
		let checkbox = document.createElement("input");
		checkbox.setAttribute("type", "checkbox");
		checkbox.style.display = "none";
		checkbox.style.width = "25px";
		checkbox.style.height = "25px";
		
		// Darken weekend checkboxes
		if (input.style["background-color"] === "rgb(225, 225, 225)") {
			checkbox.style.opacity = 0.6;
		}
		
		// Highlight bank holiday checkboxes
		if (input.classList.contains("bankHolidayDay")) {
			checkbox.classList.add("bankHolidayDay");
		}
		
		// Check checkbox if day has hours assigned
		checkbox.checked = Number(input.value) === 7.5;
		
		
		checkbox.onchange = event => input.value = event.target.checked ? "7.5" : "";
		input.insertAdjacentElement('afterend', checkbox);
		return checkbox;
	});
	
	
	// Add toggle button button to menubar
	let checkboxName = "toggleMode";
	let buttonRow = document.querySelector("#SubMenuUC1_SubMenu_div1 > table > tbody > tr");
	
	let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
	checkbox.id = checkboxName;
    checkbox.checked = defaultMode;
	
	function changeSelectMode(enabled) {
		// Show & hide checkboxes or text input fields
		checkboxes.forEach(combo => combo.style.display = enabled ? "block" : "none");
		inputs.forEach(combo => combo.style.display = enabled ? "none" : "block");
	}
	
	checkbox.addEventListener('change', (event) => {
		let checkboxMode = event.target.checked;
		
		changeSelectMode(event.target.checked);
	});
	if (defaultMode) changeSelectMode(true);
	
	let label = document.createElement('label');
    label.htmlFor = checkboxName; /* Link clicks to checkbox element */
    label.innerText = "Select mode";
	
	let container = document.createElement("div");
	container.id = "toggleModeContainer";
	container.appendChild(checkbox);
	container.appendChild(label);
	
	buttonRow.appendChild(container);
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





// Returns true if a date falls on a bank holiday inside JSON events
function isBankHoliday(selectedDate, holidaysJSON) {
    for (let i = 0; i < holidaysJSON.length; i++) {
        let dateObj = new Date(holidaysJSON[i].date);

        // Compare milliseconds since the Unix Epoch (JS safe way to compare dates)
        if (dateObj.getTime() == selectedDate.getTime()) {
            return true;
        }
    }
    return false;
}

// Runs callback for each calender cell that represents a bank holiday day
function forEachBankHolidayCell(myBankHolidays, callback) {

    // Based off DTX's own cal-validator code for longevity:
    //  checkCalendarValues(control,page,OverrideVAT) in https://missbhadtx03.corp.capgemini.com/DTX.NET/Scripts/script.js
    let strCalendarDayPrefix = "calDates_txtCalDate";
    try {
        let selectedDateObj = document.getElementById("drpIncurredPeriod") || document.getElementById("drpPeriods");
        let selectedDateText = selectedDateObj.options[selectedDateObj.selectedIndex].text;
        let selectedDate = new Date(selectedDateText);

        for (let intCnt = 1; intCnt < 32; intCnt++) {
            let obj = document.getElementById(strCalendarDayPrefix + intCnt.toString());

            // Check there's a calender day input for this date
            if (obj != null) {
                selectedDate.setDate(intCnt); // Update date's date
                if (isBankHoliday(selectedDate, myBankHolidays)) {
                    callback(obj);
                }
            }
        }
    } catch (e) {
        console.warn("Error in checkCalendarValues - \n" + e.message);
    }
}

// Highlights bank holiday cells in calender views
function handleShowBankHolidays(myBankHolidays) {
    forEachBankHolidayCell(myBankHolidays, function(cell) {
        cell.classList.add("bankHolidayDay");
        cell.placeholder = "Bank H";

        // Remove 0 so placeholder text can show
        // Useful in calenders such as "Period Overview"
        if (cell.value === "0") cell.value = "";
    });
}


// Pulls bank holidays from UK gov site and sends them to handler
function fetchBankHolidaysJSON(callback) {
    const endpoint = setting_apiURL;
    fetch(endpoint)
        .then((response) => response.json())
        .then((data) => callback(data));
}



chrome.storage.sync.get({
	shortcutKeys: true,
	selectMode: true,
	showBankHolidays: true,
	holidayRegion: 'england-and-wales',
}, function(items) {

	fixMissingButtons();
	fixInputEventHandlers();

	if (items.shortcutKeys) injectShortcutKeys();


	// Check calender is on page before injecting calender features
	if (!!document.getElementById("calDates_tabCalendar")) {
		
		// Inject bank holiday features
		fetchBankHolidaysJSON(function(holidaysJSON) {
			// Get bank holidays table based off user's settings
			let myBankHolidays = holidaysJSON[items.holidayRegion];
			try {
				if (!myBankHolidays) {throw "Invalid region!"}
				myBankHolidays = holidaysJSON[items.holidayRegion].events;
			} catch(e) {
				console.warn("ERROR:\n" + e.message);
				return;
			}

			if (items.showBankHolidays) handleShowBankHolidays(myBankHolidays);
			
			loadSelectMode(items.selectMode); // Inject checkbox mode
		});
	}
	
	console.log("Loading finished");
});