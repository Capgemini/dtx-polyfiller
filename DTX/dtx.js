
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

`;
document.head.appendChild(elt);
