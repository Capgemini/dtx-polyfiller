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
		function checkboxChangedHandler(checkbox) {
			input.value = checkbox.checked ? "7.5" : "";
			checkbox.classList.remove("semiChecked");
		}
		
		// Register click hanlder for checkbox container (parent & children)
		//  This makes it easier to select checkboxes, as you can click
		//  the surrounding area or date label to toggle the checkbox
		checkbox.parentNode.addEventListener("click", function(event) {
			
			// Check that select mode is enabled
			if (checkbox.style.display !== "none") {
				if (event.target !== checkbox) checkbox.checked = !checkbox.checked; // Change checked state (if user didn't click checkbox)
				checkboxChangedHandler(checkbox); // Fire handler
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
	autoFillButton.id = "autoFillButton";
	
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


// Adds shortcut button to instantly add standard UK time hours
function injectStandardUKTimeButton() {
	
	let ukTimeButton = document.createElement("img");
	// ukTimeButton.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVDMkU5RThFMEQyQzExRTZBNjQ0QjE3RjAwNURBQUZDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVDMkU5RThGMEQyQzExRTZBNjQ0QjE3RjAwNURBQUZDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RUMyRTlFOEMwRDJDMTFFNkE2NDRCMTdGMDA1REFBRkMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RUMyRTlFOEQwRDJDMTFFNkE2NDRCMTdGMDA1REFBRkMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5BsllBAAAINElEQVR42pxX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";
	ukTimeButton.src = chrome.extension.getURL("images/uk-time.png");
	ukTimeButton.id = "ukTimeButton";
	
	let ukTimeButtonLink = document.createElement("a");
	ukTimeButtonLink.style.width = "32px";
	ukTimeButtonLink.style.height = "36px";
	ukTimeButtonLink.href = "item.aspx?op=create&categoryId=51&itemStatus=2&categoryGroup=Time";
	ukTimeButtonLink.appendChild(ukTimeButton);
	
	let ukTimeButtonContainer = document.createElement("li");
	ukTimeButtonContainer.appendChild(ukTimeButtonLink);
	
	// Add button to menu bars (supporting both bars, by making a clone of the element)
	document.getElementById("jsddm_summary").insertAdjacentElement('afterbegin', ukTimeButtonContainer);
	document.getElementById("jsddm_item").insertAdjacentElement('afterbegin', ukTimeButtonContainer.cloneNode(true));
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
	injectStandardUKTimeButton();

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