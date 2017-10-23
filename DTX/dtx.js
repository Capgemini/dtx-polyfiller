document.querySelectorAll('input')
  .forEach(input => {
    try {
      input.addEventListener('change', input.getAttribute('onpropertychange'));
    } catch (e) {
    }
    input.setAttribute('onchange', input.getAttribute('onpropertychange'));    
  });

document.querySelectorAll('input[type="button"]')
  .forEach(button => {
    button.style.visibility = "visible";
  });