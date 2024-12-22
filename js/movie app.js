const apikey = "bb54f7b2b7df1fb3997388d5d115ba52";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const searchurl = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=`;
const discoverurl = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apikey}`;
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isFetching = false;

// Fetch JSON data from a URL
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch data.");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Fetch and display results based on a URL
async function fetchAndShowResult(url) {
    if (isFetching) return;
    isFetching = true;

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loader.innerText = "Loading...";
    result.appendChild(loader);

    const data = await fetchData(url);
    result.removeChild(loader);
    if (data && data.results) {
        showResults(data.results);
    }
    isFetching = false;
}

// Create a movie card HTML template
function createMovieCard(movie) {
    const { poster_path, original_title, release_date, overview } = movie;
    const imagePath = poster_path ? imgApi + poster_path : "https://via.placeholder.com/285x360";
    const truncatedTitle = original_title.length > 15 ? original_title.slice(0, 15) + "..." : original_title;
    const formattedDate = release_date || "No release date";
    const cardTemplate = `
     <div class="column">
         <div class="card">
             <a class="card-media" href="${imagePath}">
                 <img src="${imagePath}" alt="${original_title}" width="100%"/>
             </a>
             <div class="card-content">
                 <div class="card-header">
                     <div class="left-content">
                         <h3 style="font-weight: 600">${truncatedTitle}</h3>
                         <span style="color: #12efec">${formattedDate}</span>
                     </div>
                     <div class="right-content">
                         <a href="${imagePath}" target="_blank" class="card-btn">See Cover</a>
                     </div>
                 </div>
                 <div class="info">
                     ${overview || "No overview yet..."}
                 </div>
             </div>
         </div>
     </div>
     `;
     return cardTemplate;
}

// Clear results
function clearResults() {
    result.innerHTML = "";
}

// Display results
function showResults(items) {
    const newContent = items.map(createMovieCard).join("");
    result.innerHTML += newContent || "<p>No results found.</p>";
}

// Load more results when scrolling to the bottom
async function loadMoreResults() {
    page++;
    const searchTerm = query.value.trim();
    const url = searchTerm
        ? `${searchurl}${searchTerm}&page=${page}`
        : `${discoverurl}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect if user has scrolled to the bottom
function detectEndOfPage() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20 && !isFetching) {
        loadMoreResults();
    }
}

// Handle search form submission
async function handleSearch(event) {
    event.preventDefault();
    const searchTerm = query.value.trim();
    if (searchTerm) {
        clearResults();
        page = 1;
        const searchUrl = `${searchurl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(searchUrl);
    }
}

// Initialize app with popular movies
async function init() {
    clearResults();
    const url = `${discoverurl}&page=${page}`;
    await fetchAndShowResult(url);
}

// Event listeners
form.addEventListener("submit", handleSearch);
window.addEventListener("scroll", detectEndOfPage);

// Initialize on page load
init();
