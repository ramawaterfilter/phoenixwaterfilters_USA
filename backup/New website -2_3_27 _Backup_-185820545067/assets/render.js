window.standname = 'No Stand';

function updateFilterTypes() {
    var selectedSizeInput = document.querySelector("#size-options input:checked");
    if (!selectedSizeInput) return;

    var selectedSize = selectedSizeInput.value.trim();
    var filterTypes = document.querySelectorAll(".filter-type-options .radio-option");

    filterTypes.forEach(function (type) {
        if (!type.classList.contains('NoStand')) {
            var variantId = type.getAttribute("data-variant-id") || "";
            if (variantId.includes(selectedSize)) {
                type.style.display = "flex";
                if (window.standname == type.getAttribute("data-variant-title")) {
                    type.querySelector('input').click();
                };

                var main_price = parseFloat(document.querySelector('.product-dyn-price').textContent.split('$'));
                var data_compare = parseFloat(document.querySelector('span[data-compare] s').textContent.split('$'));
                var change_main_price = parseFloat(document.querySelector('[data-stand-price]').textContent.split('$'));
                var change_main_price = parseFloat(document.querySelector('.product-dyn-price').textContent.split('$'));


            } else {
                type.style.display = "none";
            }
        }
    });
}
var sizeInputs = document.querySelectorAll("#size-options input[type='radio']");
sizeInputs.forEach(function (input) {
    input.addEventListener("change", updateFilterTypes);
});
window.addEventListener("DOMContentLoaded", updateFilterTypes);

function initRadioOptionClick() {
  const stapSelector = document.querySelector(".stap_seletor");
  if (stapSelector) {
    stapSelector.textContent = "No Stand"; 
  }
  document.querySelectorAll(".filter-type-options .radio-option").forEach(function (option) {
    option.addEventListener("click", function () {
      const variantTitle = this.getAttribute("data-variant-title");
      if (stapSelector) {
        stapSelector.textContent = variantTitle;
        window.standname = variantTitle;
      }
    });
  });
}


document.addEventListener("DOMContentLoaded", function () {
  initRadioOptionClick();
});


