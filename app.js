// Dictionary App Logic

const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('results');

// Event listeners
searchInput.addEventListener('input', handleSearch);
clearBtn.addEventListener('click', clearSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearSearch();
    }
});

function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Show/hide clear button
    if (searchTerm.length > 0) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }
    
    // If search is empty, show welcome message
    if (searchTerm.length === 0) {
        showWelcomeMessage();
        return;
    }
    
    // Search for matches
    const results = searchDictionary(searchTerm);
    displayResults(results, searchTerm);
}

function searchDictionary(searchTerm) {
    return dictionaryData.filter(entry => {
        const matchesWord = entry.word.toLowerCase().includes(searchTerm);
        const matchesTranslation = entry.translation && entry.translation.toLowerCase().includes(searchTerm);
        const matchesSynonyms = entry.synonyms && entry.synonyms.some(syn => 
            syn.toLowerCase().includes(searchTerm)
        );
        
        return matchesWord || matchesTranslation || matchesSynonyms;
    });
}

function displayResults(results, searchTerm) {
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>Ei tuloksia / No results found</h3>
                <p>No matches for "<strong>${escapeHtml(searchTerm)}</strong>"</p>
                <p>Try searching for a different word.</p>
            </div>
        `;
        return;
    }
    
    const resultsHTML = results.map(entry => {
        const synonymsHTML = entry.synonyms && entry.synonyms.length > 0
            ? `<div class="entry-synonyms">
                <strong>Synonyms:</strong> ${entry.synonyms.map(s => escapeHtml(s)).join(', ')}
               </div>`
            : '';
        
        return `
            <div class="entry">
                <h2 class="entry-word">${escapeHtml(entry.word)}</h2>
                <p class="entry-translation">${escapeHtml(entry.translation)}</p>
                ${synonymsHTML}
            </div>
        `;
    }).join('');
    
    resultsContainer.innerHTML = resultsHTML;
}

function showWelcomeMessage() {
    resultsContainer.innerHTML = `
        <div class="welcome-message">
            <h2>Tervetuloa! / Welcome!</h2>
            <p>Start typing to search for translations.</p>
            <p>Aloita kirjoittamalla etsiäksesi käännöksiä.</p>
        </div>
    `;
}

function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    showWelcomeMessage();
    searchInput.focus();
}

// Utility function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Focus search input on page load
window.addEventListener('load', () => {
    searchInput.focus();
});
