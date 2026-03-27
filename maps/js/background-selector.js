// Create background color selector dropdown
function createBackgroundSelector() {
  // Create a form group for the background selector
  const backgroundGroup = document.createElement("div");
  backgroundGroup.className = "form-group background";
  
  // Create the label for the dropdown
  const backgroundLabel = document.createElement("label");
  backgroundLabel.setAttribute("for", "background-color");
  backgroundLabel.id = "backgroundLabel";
  backgroundLabel.textContent = "Background:";
  
  // Create the select element
  const backgroundSelect = document.createElement("select");
  backgroundSelect.id = "background-color";
  
  // Define color options with their labels, values, and color codes
  const colorOptions = [
    { value: "blue", label: "Blue", color: "#00c6ff" },
    { value: "default", label: "Default (Purple)", color: "#a8c0ff" },
    { value: "dark", label: "Dark", color: "#232526" },
    { value: "green", label: "Green", color: "#11998e" },
    { value: "purple", label: "Purple", color: "#834d9b" },
    { value: "red", label: "Red", color: "#cb2d3e" }
  ];
  
  // Add color options to the dropdown with color previews
  colorOptions.forEach(option => {
    const colorOption = document.createElement("option");
    colorOption.value = option.value;
    colorOption.innerHTML = `<span class="background-preview" style="background-color: ${option.color}"></span>${option.label}`;
    colorOption.dataset.color = option.color;
    backgroundSelect.appendChild(colorOption);
  });
  
  // Add elements to the form group
  backgroundGroup.appendChild(backgroundLabel);
  backgroundGroup.appendChild(backgroundSelect);
  
  // Find the selectors container (now in header)
  const selectorsContainer = document.getElementById("selectors-container");
  
  if (selectorsContainer) {
    // Add our background selector to the container
    selectorsContainer.appendChild(backgroundGroup);
  } else {
    // If we couldn't find the selectors container, create one in the header
    console.log("Selectors container not found, creating one in header");
    
    // Create a container for the background selector
    const newSelectorsContainer = document.createElement("div");
    newSelectorsContainer.id = "selectors-container";
    newSelectorsContainer.className = "header-selectors";
    
    // Add the background selector to the container
    newSelectorsContainer.appendChild(backgroundGroup);
    
    // Add the container to the nav header
    const navHeader = document.querySelector(".nav-header");
    if (navHeader) {
      navHeader.appendChild(newSelectorsContainer);
    } else {
      // If nav header not found, add to body as fallback
      document.body.insertBefore(newSelectorsContainer, document.body.firstChild);
    }
  }
  
  // Add event listener to change background when selection changes
  backgroundSelect.addEventListener("change", (event) => {
    const selectedBackground = event.target.value;
    // Save the selected background to localStorage
    localStorage.setItem('defaultBackground', selectedBackground);
    applyBackground(selectedBackground);
  });
  
  // Define translations for the background label
  const bgLabelTranslations = {
    en: "Background:",
    bg: "Фон:",
    de: "Hintergrund:"
  };
  
  // Update the label when language changes
  const updateBackgroundLabel = () => {
    const langSelect = document.getElementById("language");
    if (langSelect) {
      const currentLang = langSelect.value;
      backgroundLabel.textContent = bgLabelTranslations[currentLang] || "Background:";
    }
  };
  
  // Listen for language changes
  const languageSelect = document.getElementById("language");
  if (languageSelect) {
    languageSelect.addEventListener("change", updateBackgroundLabel);
  }
  
  // Set initial label based on current language
  updateBackgroundLabel();
  
  // Style the background selector
  backgroundSelect.style.paddingLeft = "40px";
}

// Function to apply the selected background
function applyBackground(background) {
  // Remove any previously applied background classes
  document.body.classList.remove("bg-default", "bg-blue", "bg-dark", "bg-green", "bg-purple", "bg-red");
  
  // Apply the selected background with animation
  document.body.style.transition = "background 0.5s ease";
  
  // Apply the selected background
  switch (background) {
    case "default":
      document.body.style.background = "linear-gradient(135deg, #a8c0ff, #3f2b96)";
      break;
    case "blue":
      document.body.style.background = "linear-gradient(135deg, #00c6ff, #0072ff)";
      break;
    case "dark":
      document.body.style.background = "linear-gradient(135deg, #232526, #414345)";
      break;
    case "green":
      document.body.style.background = "linear-gradient(135deg, #11998e, #38ef7d)";
      break;
    case "purple":
      document.body.style.background = "linear-gradient(135deg, #834d9b, #d04ed6)";
      break;
    case "red":
      document.body.style.background = "linear-gradient(135deg, #cb2d3e, #ef473a)";
      break;
    default:
      document.body.style.background = "linear-gradient(135deg, #a8c0ff, #3f2b96)";
  }
  
  // Update form container background to complement the main background
  const formContainer = document.querySelector('.form-container');
  if (formContainer) {
    formContainer.style.transition = "background 0.5s ease, box-shadow 0.5s ease";
    
    // Adjust form container background based on selected background
    switch (background) {
      case "dark":
        formContainer.style.background = "rgba(20, 20, 20, 0.8)";
        break;
      default:
        formContainer.style.background = "rgba(28, 46, 74, 0.8)";
    }
  }
}

// Initialize the background selector when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // We need to wait a bit to ensure the language selector is added to the DOM
  setTimeout(function() {
    createBackgroundSelector();
    
    // Get the saved background from localStorage or use "blue" as fallback
    const savedBackground = localStorage.getItem('defaultBackground') || "blue";
    
    // Apply the saved background
    applyBackground(savedBackground);
    
    // Update the select element to show the saved background
    const backgroundSelect = document.getElementById("background-color");
    if (backgroundSelect) {
      backgroundSelect.value = savedBackground;
    }
  }, 100);
});