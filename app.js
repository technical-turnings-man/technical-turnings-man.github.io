// app.js
// Dictionary App Logic

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const resultsContainer = document.getElementById("results");

// Normalize text for nicer matching (ä/ö etc.)
function normalizeText(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/\s+/g, " ")
    .trim();
}

// Event listeners
searchInput.addEventListener("input", handleSearch);
clearBtn.addEventListener("click", clearSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") clearSearch();
});

function handleSearch() {
  const raw = searchInput.value.trim();
  const searchTerm = normalizeText(raw);

  // Show/hide clear button
  if (raw.length > 0) clearBtn.classList.add("visible");
  else clearBtn.classList.remove("visible");

  // Empty -> welcome
  if (searchTerm.length === 0) {
    showWelcomeMessage();
    return;
  }

  const results = searchDictionary(searchTerm);
  displayResults(results, raw);
}

function searchDictionary(searchTerm) {
  const matches = dictionaryData.filter((entry) => {
    const word = normalizeText(entry.word);
    const translation = normalizeText(entry.translation);
    const syns = Array.isArray(entry.synonyms) ? entry.synonyms : [];
    const synText = syns.map(normalizeText);

    const matchesWord = word.includes(searchTerm);
    const matchesTranslation = translation.includes(searchTerm);
    const matchesSynonyms = synText.some((s) => s.includes(searchTerm));

    return matchesWord || matchesTranslation || matchesSynonyms;
  });

  // Sort like a dictionary:
  // exact headword match -> startsWith headword -> contains headword -> others
  matches.sort((a, b) => scoreEntry(a, searchTerm) - scoreEntry(b, searchTerm));
  return matches;
}

function scoreEntry(entry, searchTerm) {
  const w = normalizeText(entry.word);
  if (w === searchTerm) return 0;
  if (w.startsWith(searchTerm)) return 1;
  if (w.includes(searchTerm)) return 2;

  const t = normalizeText(entry.translation);
  if (t.includes(searchTerm)) return 3;

  const syns = Array.isArray(entry.synonyms) ? entry.synonyms : [];
  const s = normalizeText(syns.join(" "));
  if (s.includes(searchTerm)) return 4;

  return 5;
}

function displayResults(results, rawQuery) {
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <h3>Ei tuloksia / No results found</h3>
        <p>No matches for "<strong>${escapeHtml(rawQuery)}</strong>"</p>
        <p>Try searching for a different word.</p>
      </div>
    `;
    return;
  }

  const resultsHTML = results
    .map((entry) => {
      const synonymsHTML =
        entry.synonyms && entry.synonyms.length > 0
          ? `<div class="entry-synonyms">
               <strong>Synonyms:</strong> ${entry.synonyms.map((s) => escapeHtml(s)).join(", ")}
             </div>`
          : "";

      return `
        <div class="entry">
          <h2 class="entry-word">${escapeHtml(entry.word)}</h2>
          <div class="entry-translation">${escapeHtml(entry.translation)}</div>
          ${synonymsHTML}
        </div>
      `;
    })
    .join("");

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
  searchInput.value = "";
  clearBtn.classList.remove("visible");
  showWelcomeMessage();
  searchInput.focus();
}

// Utility function to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Focus search input on page load
window.addEventListener("load", () => {
  searchInput.focus();
});
