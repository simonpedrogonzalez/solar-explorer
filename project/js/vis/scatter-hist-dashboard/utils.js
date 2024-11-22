export const populateSelect = (selectElement, options) => {
    selectElement.innerHTML = '';
    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.text;
        selectElement.appendChild(newOption);
    });
}