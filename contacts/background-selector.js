document.addEventListener('DOMContentLoaded', function() {
  // Function to create and append the background selector
  function createBackgroundSelector() {
    const selectorsContainer = document.getElementById('selectors-container');
    if (!selectorsContainer) {
      console.error('Selectors container not found!');
      return;
    }

    const backgroundGroup = document.createElement('div');
    backgroundGroup.className = 'form-group background';

    const backgroundLabel = document.createElement('label');
    backgroundLabel.setAttribute('for', 'background-color');
    backgroundLabel.id = 'backgroundLabel';
    backgroundLabel.textContent = 'Background:'; // Default text, will be updated by translation

    const backgroundSelect = document.createElement('select');
    backgroundSelect.id = 'background-color';

    const backgrounds = [
      { value: 'default', label: 'Default' },
      { value: 'blue', label: 'Blue' },
      { value: 'dark', label: 'Dark' },
      { value: 'green', label: 'Green' },
      { value: 'purple', label: 'Purple' },
      { value: 'red', label: 'Red' }
    ];

    backgrounds.forEach(bg => {
      const option = document.createElement('option');
      option.value = bg.value;
      option.textContent = bg.label;
      backgroundSelect.appendChild(option);
    });

    backgroundGroup.appendChild(backgroundLabel);
    backgroundGroup.appendChild(backgroundSelect);
    selectorsContainer.appendChild(backgroundGroup);

    // Apply saved background from localStorage
    const savedBackground = localStorage.getItem('defaultBackground') || 'blue';
    backgroundSelect.value = savedBackground;

    // Add event listener for background change
    backgroundSelect.addEventListener('change', (event) => {
      const selectedBackground = event.target.value;
      localStorage.setItem('defaultBackground', selectedBackground);
      applyBackground(selectedBackground);
    });
  }

  // Function to apply the selected background
  function applyBackground(background) {
    // Remove any previously applied background classes
    document.body.classList.remove("bg-default", "bg-blue", "bg-dark", "bg-green", "bg-purple", "bg-red");

    // Apply the selected background and add corresponding CSS class for logo aura
    switch (background) {
      case "default":
        document.body.style.background = "linear-gradient(135deg, #a8c0ff, #3f2b96)";
        document.body.classList.add("bg-default");
        break;
      case "blue":
        document.body.style.background = "linear-gradient(135deg, #00c6ff, #0072ff)";
        document.body.classList.add("bg-blue");
        break;
      case "dark":
        document.body.style.background = "linear-gradient(135deg, #232526, #414345)";
        document.body.classList.add("bg-dark");
        break;
      case "green":
        document.body.style.background = "linear-gradient(135deg, #11998e, #38ef7d)";
        document.body.classList.add("bg-green");
        break;
      case "purple":
        document.body.style.background = "linear-gradient(135deg, #834d9b, #d04ed6)";
        document.body.classList.add("bg-purple");
        break;
      case "red":
        document.body.style.background = "linear-gradient(135deg, #cb2d3e, #ef473a)";
        document.body.classList.add("bg-red");
        break;
      default:
        document.body.style.background = "linear-gradient(135deg, #a8c0ff, #3f2b96)";
        document.body.classList.add("bg-default");
    }
  }

  // Call the function to create the background selector when the DOM is loaded
  createBackgroundSelector();
});