/**
 * Episode Picker UI Script
 * 
 * This script manages the UI for a browser extension that lets users
 * randomly select episodes from TV shows. It loads episode data from
 * a JSON file, populates UI controls, and handles user interactions.
 */

// Global state to store episode data loaded from JSON
let episodeData = {};

/**
 * Loads episode data from the episodeLists.json file.
 * This file contains a structured list of episodes organized by show and season.
 * 
 * Expected JSON format:
 * {
 *   "Show Name": {
 *     "Season 1": ["url1", "url2", ...],
 *     "Season 2": ["url3", "url4", ...]
 *   },
 *   "Another Show": { ... }
 * }
 */
function loadEpisodeData() {
    const url = chrome.runtime.getURL('episodeLists.json');

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Episode data loaded successfully");
            episodeData = data;
            populateShowSelect();
        })
        .catch(error => {
            console.error("Error loading episodeLists.json:", error);
            updateStatus("Failed to load episode data. Please check the console for details.");
        });
}

/**
 * Populates the show selection dropdown with available shows.
 * Creates an option element for each show in the loaded episode data.
 */
function populateShowSelect() {
    const showSelect = document.getElementById("showSelect");

    // Clear existing options
    showSelect.innerHTML = "";

    // Get all show names and sort alphabetically
    const showNames = Object.keys(episodeData).sort();

    // Create and append options for each show
    showNames.forEach(show => {
        const option = document.createElement("option");
        option.value = show;
        option.textContent = show;
        showSelect.appendChild(option);
    });

    // If we have shows, populate season checkboxes for the first show
    if (showNames.length > 0) {
        populateSeasonCheckboxes(showNames[0]);
        updateStatus(`Loaded ${showNames.length} shows`);
    } else {
        updateStatus("No shows found in the episode data");
    }
}

/**
 * Populates the season checkboxes for a given show.
 * Creates a checkbox for each season of the selected show.
 * 
 * @param {string} showName - The name of the show to display seasons for
 */
function populateSeasonCheckboxes(showName) {
    const seasonContainer = document.getElementById("seasonContainer");

    // Clear existing checkboxes
    seasonContainer.innerHTML = "";

    // Check if we have data for this show
    if (!episodeData[showName]) {
        updateStatus(`No data found for ${showName}`);
        return;
    }

    // Get all seasons and sort them numerically if possible
    const seasons = Object.keys(episodeData[showName]).sort((a, b) => {
        // Extract numbers from season names (if they exist)
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));

        // If both seasons have numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        // Otherwise sort alphabetically
        return a.localeCompare(b);
    });

    // Create checkbox, label, and container for each season
    seasons.forEach(season => {
        // Create elements
        const container = document.createElement("div");
        container.className = "season-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = season;
        checkbox.id = `season_${showName}_${season}`.replace(/\s+/g, '_');
        checkbox.checked = true;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = season;

        // Add episode count in parentheses
        const episodeCount = episodeData[showName][season].length;
        label.textContent += ` (${episodeCount} episodes)`;

        // Assemble and append
        container.appendChild(checkbox);
        container.appendChild(label);
        seasonContainer.appendChild(container);
    });

    updateStatus(`${showName}: ${seasons.length} seasons available`);
}

/**
 * Updates the status message displayed to the user.
 * 
 * @param {string} message - The message to display
 */
function updateStatus(message) {
    const statusElement = document.getElementById("status");
    statusElement.textContent = message;
    console.log(`Status: ${message}`);
}

/**
 * Picks a random episode based on user selections.
 * Gathers all episodes from selected show/seasons and picks one randomly.
 */
function pickRandomEpisode() {
    // Get selected show
    const showSelect = document.getElementById("showSelect");
    const selectedShow = showSelect.value;

    // Get selected mode (all seasons or specific seasons)
    const mode = document.querySelector('input[name="mode"]:checked').value;

    // Validate show selection
    if (!episodeData[selectedShow]) {
        updateStatus("No data available for the selected show");
        return;
    }

    // Collect episodes based on mode
    let episodes = [];

    if (mode === "all") {
        // Add all episodes from all seasons
        for (const season in episodeData[selectedShow]) {
            episodes = episodes.concat(episodeData[selectedShow][season]);
        }
    } else if (mode === "selected") {
        // Get checked seasons
        const checkedSeasons = Array.from(
            document.querySelectorAll("#seasonContainer input[type='checkbox']:checked")
        ).map(checkbox => checkbox.value);

        // Add episodes from checked seasons
        checkedSeasons.forEach(season => {
            if (episodeData[selectedShow][season]) {
                episodes = episodes.concat(episodeData[selectedShow][season]);
            }
        });
    }

    // Validate episode collection
    if (episodes.length === 0) {
        updateStatus("No episodes found for the selected criteria");
        return;
    }

    // Pick a random episode
    const randomIndex = Math.floor(Math.random() * episodes.length);
    const randomEpisodeUrl = episodes[randomIndex];

    updateStatus(`Opening random episode (${episodes.length} episodes available)...`);

    // Open the random episode in a new tab
    chrome.tabs.create({ url: randomEpisodeUrl });
}

/**
 * Toggles the visibility of the season selection container based on mode.
 */
function toggleSeasonContainer() {
    const seasonContainer = document.getElementById("seasonContainer");
    const mode = document.querySelector('input[name="mode"]:checked').value;

    seasonContainer.style.display = (mode === "selected") ? "block" : "none";
}

/**
 * Initializes the UI by setting up event listeners.
 */
function initializeUI() {
    // Update seasons when show changes
    document.getElementById("showSelect").addEventListener("change", function () {
        populateSeasonCheckboxes(this.value);
    });

    // Toggle season container when mode changes
    document.getElementsByName("mode").forEach(radio => {
        radio.addEventListener("change", toggleSeasonContainer);
    });

    // Handle random episode button click
    document.getElementById("pickBtn").addEventListener("click", pickRandomEpisode);

    // Initialize mode-based UI state
    toggleSeasonContainer();
}

/**
 * Entry point for the script.
 * Loads episode data and initializes UI when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("Episode Picker UI initializing...");
    loadEpisodeData();
    initializeUI();
});