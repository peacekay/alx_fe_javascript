const API_URL = "https://mockapi.io/projects/quotes"; // Replace with your actual MockAPI endpoint

document.addEventListener("DOMContentLoaded", function () {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteButton = document.getElementById("newQuote");
    const newQuoteText = document.getElementById("newQuoteText");
    const newQuoteCategory = document.getElementById("newQuoteCategory");
    const categoryFilter = document.getElementById("categoryFilter");
    const importFile = document.getElementById("importFile");
    const notificationBox = document.getElementById("notification"); // Add notification element in HTML

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

    async function fetchServerQuotes() {
        try {
            const response = await fetch(API_URL);
            const serverQuotes = await response.json();
            mergeQuotes(serverQuotes);
        } catch (error) {
            console.error("Error fetching quotes:", error);
        }
    }

    function mergeQuotes(serverQuotes) {
        let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
        let newQuotes = serverQuotes.filter(sq => !localQuotes.some(lq => lq.text === sq.text));

        if (newQuotes.length > 0) {
            quotes = [...localQuotes, ...newQuotes];
            saveQuotes();
            showNotification(`${newQuotes.length} new quotes added from server.`);
            populateCategories();
            filterQuotes();
        }
    }

    //  ["fetchQuotesFromServer"]
    //  ["https://jsonplaceholder.typicode.com/posts"]
    function saveQuotes() {
        localStorage.setItem("quotes", JSON.stringify(quotes));
    }

    async function syncNewLocalQuotes() {
        const unsyncedQuotes = quotes.filter(q => !q.id); // Only new quotes
        for (let quote of unsyncedQuotes) {
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(quote)
                });
                const savedQuote = await response.json();
                quote.id = savedQuote.id; // Update local copy with server ID
                saveQuotes();
            } catch (error) {
                console.error("Error syncing new quotes:", error);
            }
        }
    }

    function showNotification(message) {
        notificationBox.textContent = message;
        notificationBox.style.display = "block";
        setTimeout(() => { notificationBox.style.display = "none"; }, 3000);
    }

    function populateCategories() {
        const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];

        categoryFilter.innerHTML = categories
            .map(category => `<option value="${category}">${category}</option>`)
            .join("");

        const savedFilter = localStorage.getItem("selectedCategory");
        if (savedFilter) {
            categoryFilter.value = savedFilter;
            filterQuotes();
        }
    }

    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem("selectedCategory", selectedCategory);

        const filteredQuotes = selectedCategory === "All Categories"
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = "No quotes in this category.";
        } else {
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" - Category: ${filteredQuotes[randomIndex].category}`;
        }
    }

    function addQuote() {
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();

        if (text === "" || category === "") {
            alert("Please enter both quote text and category.");
            return;
        }

        const newQuote = { text, category }; // No ID until synced
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        showNotification("Quote added locally. Syncing with server...");
        syncNewLocalQuotes(); // Sync new quote to server

        newQuoteText.value = "";
        newQuoteCategory.value = "";
    }

    setInterval(fetchServerQuotes, 10000); // Check for updates every 10 sec
    fetchServerQuotes(); // Initial fetch
    populateCategories();

    newQuoteButton.addEventListener("click", filterQuotes);
    document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
});
