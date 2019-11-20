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
			input.classList.add("weekend");
			checkbox.classList.add("weekend");
		}
		
		// Highlight bank holiday checkboxes
		if (input.classList.contains("bankHolidayDay")) {
			checkbox.classList.add("bankHolidayDay");
		}
		
		// Add checkbox to calender
		input.insertAdjacentElement('afterend', checkbox);
		
		// Handler for when checkbox is changed
		function checkboxClickHandler(checkbox) {
			input.value = checkbox.checked ? "7.5" : "";
			checkbox.classList.remove("semiChecked");
		}
		
		// Register handler for checkbox changed
		checkbox.addEventListener("onchange", function(event) {
			checkboxClickHandler(event.target);
		});
		
		// Register hanlder for checkbox container (parent) clicked
		//  This makes it easier to select checkboxes, as you can click
		//  the surrounding area or date label to toggle the checkbox
		checkbox.parentNode.addEventListener("click", function(event) {
			if (event.target == checkbox) return; // Check the user missed the checkbox
			
			// Check that select mode is enabled
			if (checkbox.style.display !== "none") {
				checkbox.checked = !checkbox.checked; // Change checked state
				checkboxClickHandler(checkbox); // Fire handler
			}
		});
		
		return checkbox;
	});
	
	
	// Add toggle button button to menubar
	let selectModeCheckboxName = "toggleMode";
	
	let selectModeCheckbox = document.createElement("input");
    selectModeCheckbox.type = "checkbox";
	selectModeCheckbox.id = selectModeCheckboxName;
    selectModeCheckbox.checked = defaultMode;
	
	function changeSelectMode(enabled) {
		// Show & hide checkboxes or text input fields
		checkboxes.forEach(combo => combo.style.display = enabled ? "block" : "none");
		inputs.forEach(combo => combo.style.display = enabled ? "none" : "block");
		
		if (enabled) {
			inputs.forEach(function(input, index) {
				let checkbox = input.nextElementSibling;
				
				// Check checkbox if day has hours assigned
				let selectedHrs = Number(input.value);
				checkbox.checked = selectedHrs === 7.5;
				
				// Highlight checkboxes that have work hours but not a full day
				if (selectedHrs !== 7.5 && selectedHrs !== 0) {
					checkbox.classList.add("semiChecked");
				} else {
					checkbox.classList.remove("semiChecked");
				}
			});
		}
	}
	
	selectModeCheckbox.addEventListener('change', (event) => {
		changeSelectMode(event.target.checked);
	});
	if (defaultMode) changeSelectMode(true);
	
	let selectModeLabel = document.createElement('label');
    selectModeLabel.htmlFor = selectModeCheckboxName; /* Link clicks to checkbox element */
    selectModeLabel.innerText = "Select mode";
	
	let customButtonsContainer = document.getElementById("customButtonsContainer");	
	customButtonsContainer.appendChild(selectModeCheckbox);
	customButtonsContainer.appendChild(selectModeLabel);
}


// Injects a content script listener into the page with access to page functions
function injectSaveListener() {	
	var script = document.createElement('script');
	script.textContent = `
		document.addEventListener('callSaveFuncs', function() {
			if (typeof saveFromIcon === "function") saveFromIcon(); else if (typeof myPage.Save === "function") myPage.Save(); // Call DTX save button click function
		});
	`;
	document.head.appendChild(script);
	script.remove();
}

// Adds hotkeys:
//  CTRL+S to save changes
//  Escape to go home
function injectShortcutKeys() {
	injectSaveListener();
	
	document.addEventListener('keydown', function(event) {
		const keySPressed = (event.keyCode === 83 || event.keyCode === 115); // Check if code is for 's' or 'S'
		if (event.ctrlKey && keySPressed) {
			event.preventDefault(); // Prevent browser's save dialog showing
			
			var evt = document.createEvent('Event');
			evt.initEvent('callSaveFuncs', true, false);
			document.dispatchEvent(evt); // Fire the event
			
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
		dateObj.setHours(0); // Eliminate British Summer Time

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
        let selectedDate = new Date(Date.parse(selectedDateText));

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



// Auto-fills and logins in if form is avaliable on current page
function autoLogin(employeeNumber) {
    let form = document.getElementById("frmLogin");
    if (form) {
        document.body.style.visibility = "hidden"; // Hide login page
        form.elements.namedItem("txtEmployeeNumber").value = employeeNumber;
        form.submit();
    }
}


// Injects a button into calender views to quick-select multiple days
const fillModes = Object.freeze({"businessdays":0, "all":1, "none":2});
function injectAutoFillButton() {
	
	// Create fill button
	let autoFillButton = document.createElement("button");
	autoFillButton.innerText = "Auto-fill";
	autoFillButton.classList.add("autoFillButton");
	
	let fillModeIndex = 0;
	autoFillButton.addEventListener('click', (event) => {
		event.preventDefault();

		let inputs = [...document.querySelectorAll("#calDates_tabCalendar > tbody input")];
		
		let weekDayIndex = 0;
		inputs.forEach(function(input) {
			let inputIsWeekend = input.classList.contains("weekend");
			let inputIsBankHoliday = input.classList.contains("bankHolidayDay");
			
			let shouldSelect = true;
			let fillMode = Object.values(fillModes)[fillModeIndex];
			
			switch(fillMode) {
				case fillModes.all:
					break;
				case fillModes.businessdays:
					shouldSelect = !inputIsBankHoliday && !inputIsWeekend;
					break;
				default:
					shouldSelect = false;
			}
			
			// Auto-complete inputs
			if (input.type == "checkbox") {
				input.checked = shouldSelect;
			} else {
				input.value = shouldSelect ? "7.5" : "";
			}
		});
		
		// Change to next fill mode for next click
		fillModeIndex++;
		if (fillModeIndex > Object.keys(fillModes).length - 1) fillModeIndex = 0;
	});
	
	// Add autofill button to menubar
	let customButtonsContainer = document.getElementById("customButtonsContainer");	
	customButtonsContainer.appendChild(autoFillButton);
}

// Adds container to hold custom buttons in menubar for calender pages
// e.g. Select mode, auto fill etc
function injectCustomButtonsContainer() {
	let buttonRow = document.querySelector("#SubMenuUC1_SubMenu_div1 > table > tbody > tr");
	let customButtonsContainer = document.createElement("div");
	customButtonsContainer.id = "customButtonsContainer";
	buttonRow.appendChild(customButtonsContainer);
}


chrome.storage.sync.get({
	shortcutKeys: true,
	selectMode: true,
	showBankHolidays: true,
	holidayRegion: 'england-and-wales',
	autoLogin: false,
	employeeNumber: "",
}, function(items) {

    if (items.autoLogin) autoLogin(items.employeeNumber); // Run auto-login
	
	fixMissingButtons();
	fixInputEventHandlers();

	if (items.shortcutKeys) injectShortcutKeys();


	// Check calender is on page before injecting calender features
	if (!!document.getElementById("calDates_tabCalendar")) {
		injectCustomButtonsContainer();
		injectAutoFillButton();
		
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
	
	console.log("DTX Polyfiller loaded!");
});