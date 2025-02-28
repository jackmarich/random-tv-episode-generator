let episodeData = {}; // Will hold the data from episodeLists.json

// Load the episodeLists.json file.
function loadEpisodeData() {
    fetch(chrome.runtime.getURL('episodeLists.json'))
        .then(response => response.json())
        .then(data => {
            episodeData = data;
            populateShowSelect();
        })
        .catch(e => console.error("Error loading episodeLists.json:", e));
}

function populateShowSelect() {
    const showSelect = document.getElementById("showSelect");
    showSelect.innerHTML = "";
    for (let show in episodeData) {
        let opt = document.createElement("option");
        opt.value = show;
        opt.textContent = show;
        showSelect.appendChild(opt);
    }
    populateSeasonCheckboxes(showSelect.value);
}

function populateSeasonCheckboxes(showName) {
    const seasonContainer = document.getElementById("seasonContainer");
    seasonContainer.innerHTML = "";
    if (!episodeData[showName]) return;
    const seasons = Object.keys(episodeData[showName]);
    seasons.forEach(season => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = season;
        checkbox.id = "season_" + season;
        checkbox.checked = true;

        const label = document.createElement("label");
        label.htmlFor = "season_" + season;
        label.textContent = season;

        const container = document.createElement("div");
        container.appendChild(checkbox);
        container.appendChild(label);

        seasonContainer.appendChild(container);
    });
}

// Update seasons when show changes.
document.getElementById("showSelect").addEventListener("change", function () {
    populateSeasonCheckboxes(this.value);
});

// Show/hide season container based on mode.
document.getElementsByName("mode").forEach(radio => {
    radio.addEventListener("change", function () {
        const seasonContainer = document.getElementById("seasonContainer");
        if (this.value === "selected") {
            seasonContainer.style.display = "block";
        } else {
            seasonContainer.style.display = "none";
        }
    });
});

// When "Pick Random Episode" is clicked, combine the episodes per the selected criteria and open one.
document.getElementById("pickBtn").addEventListener("click", function () {
    const showSelect = document.getElementById("showSelect");
    const selectedShow = showSelect.value;

    let mode = document.querySelector('input[name="mode"]:checked').value;
    let selectedSeasons = [];
    if (mode === "selected") {
        const checkboxes = document.querySelectorAll("#seasonContainer input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedSeasons.push(checkbox.value);
            }
        });
    }

    let episodes = [];
    if (!episodeData[selectedShow]) {
        document.getElementById("status").textContent = "No data for selected show.";
        return;
    }

    if (mode === "all") {
        for (let season in episodeData[selectedShow]) {
            episodes = episodes.concat(episodeData[selectedShow][season]);
        }
    } else if (mode === "selected") {
        selectedSeasons.forEach(season => {
            if (episodeData[selectedShow][season]) {
                episodes = episodes.concat(episodeData[selectedShow][season]);
            }
        });
    }

    if (episodes.length === 0) {
        document.getElementById("status").textContent = "No episodes found for the selected criteria.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * episodes.length);
    const randomEpisodeUrl = episodes[randomIndex];
    document.getElementById("status").textContent = "Opening random episode...";

    // Open the random episode in a new tab.
    chrome.tabs.create({ url: randomEpisodeUrl });
});

document.addEventListener("DOMContentLoaded", loadEpisodeData);
