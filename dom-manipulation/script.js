// Mock API URL
const API_URL = "https://corsproxy.io/?" + encodeURIComponent("https://mockapi.io/projects/quotes");

// Local storage key
const LOCAL_STORAGE_KEY = "quotes";

// Quotes array
let quotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

// Fetch quotes from the "server"
async function fetchServerQuotes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const data = await response.json();
    quotes = data;
    saveQuotes();
    displayRandomQuote();
    populateCategories();
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Display a random quote
function displayRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quoteDisplay").innerText = quotes[randomIndex].text;
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  
  if (!text || !category) {
    alert("Both quote text and category are required.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  syncNewLocalQuotes();
}

// Sync new quotes with the "server"
async function syncNewLocalQuotes() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    console.log("Quotes synced successfully.");
  } catch (error) {
    console.error("Error syncing new quotes:", error);
  }
}

// Populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from local storage
  const lastFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = lastFilter;
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);
  
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText = filteredQuotes[randomIndex].text;
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Error parsing JSON file.");
      console.error(error);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Attach event listeners
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("exportButton").addEventListener("click", exportToJsonFile);
document.getElementById("addQuoteButton").addEventListener("click", addQuote);

// Fetch initial quotes and set up filters
// Ensure DOM is fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {
    fetchServerQuotes();
    populateCategories();
    displayRandomQuote();
    setInterval(fetchServerQuotes, 10000); // Sync every 10s
  
    // Safely attach event listeners only if elements exist
    const newQuoteBtn = document.getElementById("newQuote");
    if (newQuoteBtn) newQuoteBtn.addEventListener("click", displayRandomQuote);
  
    const importFileInput = document.getElementById("importFile");
    if (importFileInput) importFileInput.addEventListener("change", importFromJsonFile);
  
    const exportButton = document.getElementById("exportButton");
    if (exportButton) exportButton.addEventListener("click", exportToJsonFile);
  
    const addQuoteButton = document.getElementById("addQuoteButton");
    if (addQuoteButton) addQuoteButton.addEventListener("click", addQuote);
  });
  
