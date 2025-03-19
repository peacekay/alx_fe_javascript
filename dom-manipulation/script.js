document.addEventListener("DOMContentLoaded", function () {
    const quotesContainer = document.getElementById("quotesContainer");
    const showQuoteBtn = document.getElementById("showQuoteBtn");
    const addQuoteBtn = document.getElementById("addQuoteBtn");
    const quoteInput = document.getElementById("quoteInput");
    const authorInput = document.getElementById("authorInput");
    const categoryInput = document.getElementById("categoryInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const importFile = document.getElementById("importFile");
    const exportBtn = document.getElementById("exportBtn");

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Inspiration" },
        { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "Motivation" }
    ];

    /** ✅ Function to display a random quote */
    function showRandomQuote() {
        if (quotes.length === 0) {
            quotesContainer.innerHTML = "<p>No quotes available.</p>";
            return;
        }

        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];

        quotesContainer.innerHTML = `
            <blockquote>"${quote.text}"</blockquote>
            <p>- ${quote.author}</p>
            <small>Category: ${quote.category}</small>
        `;
    }

    /** ✅ Function to add a new quote */
    function addQuote() {
        const quoteText = quoteInput.value.trim();
        const quoteAuthor = authorInput.value.trim();
        const quoteCategory = categoryInput.value.trim();

        // ✅ Validation: Ensure inputs are not empty
        if (quoteText === "" || quoteAuthor === "" || quoteCategory === "") {
            alert("All fields (quote, author, category) are required.");
            return;
        }

        const newQuote = { text: quoteText, author: quoteAuthor, category: quoteCategory };
        quotes.push(newQuote);
        localStorage.setItem("quotes", JSON.stringify(quotes));

        quoteInput.value = "";
        authorInput.value = "";
        categoryInput.value = "";
        alert("Quote added successfully!");

        populateCategories();
        showRandomQuote(); // Refresh with the new quote
    }

    /** ✅ Function to populate category dropdown */
    function populateCategories() {
        const uniqueCategories = [...new Set(quotes.map(q => q.category))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        uniqueCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /** ✅ Function to filter quotes based on selected category */
    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        let filteredQuotes = quotes;

        if (selectedCategory !== "all") {
            filteredQuotes = quotes.filter(q => q.category === selectedCategory);
        }

        quotesContainer.innerHTML = "";
        filteredQuotes.forEach(q => {
            quotesContainer.innerHTML += `
                <blockquote>"${q.text}"</blockquote>
                <p>- ${q.author}</p>
                <small>Category: ${q.category}</small>
                <hr>
            `;
        });
    }

    /** ✅ Function to export quotes as JSON */
    function exportQuotes() {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotes.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /** ✅ Function to import quotes from JSON */
    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function (event) {
            try {
                const importedQuotes = JSON.parse(event.target.result);
                quotes.push(...importedQuotes);
                localStorage.setItem("quotes", JSON.stringify(quotes));
                alert("Quotes imported successfully!");
                populateCategories();
                showRandomQuote();
            } catch (error) {
                alert("Invalid JSON file!");
            }
        };
        fileReader.readAsText(event.target.files[0]);
    }

    /** ✅ Function to fetch quotes from a mock API */
    async function fetchServerQuotes() {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/posts");
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            console.log("Fetched server data:", data); // Debugging
        } catch (error) {
            console.error("Error fetching quotes:", error);
        }
    }

    /** ✅ Function to sync new local quotes to the server */
    async function syncNewLocalQuotes() {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quotes),
            });

            if (!response.ok) throw new Error("Failed to sync quotes");
            console.log("Quotes synced successfully!");
        } catch (error) {
            console.error("Error syncing new quotes:", error);
        }
    }

    /** ✅ Event Listeners */
    showQuoteBtn.addEventListener("click", showRandomQuote);
    addQuoteBtn.addEventListener("click", addQuote);
    categoryFilter.addEventListener("change", filterQuotes);
    exportBtn.addEventListener("click", exportQuotes);
    importFile.addEventListener("change", importFromJsonFile);

    // Fetch server data every 10 seconds
    setInterval(fetchServerQuotes, 10000);

    // Show a quote and populate categories when the page loads
    populateCategories();
    showRandomQuote();
});
