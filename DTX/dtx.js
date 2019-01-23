
var elt = document.createElement("script");
elt.innerHTML = `


document.querySelectorAll('input')
  .forEach(input => {
    let propertyChange = input.getAttribute("onpropertychange");
    
    try {
      input.addEventListener('change', propertyChange);
    } catch (e) {
      // Suppress
    }

    input.setAttribute('onchange', propertyChange);      
  });

document.querySelectorAll('input[type="button"]')
  .forEach(button => {
    button.style.visibility = "visible";
  });


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

`;
document.head.appendChild(elt);
