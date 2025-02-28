(function () {
    let episodeLists = {};   // To store the JSON data from episodeLists.json
    let selectedShow = "Family Guy";  // Default if we can't detect from the URL
    let hasTriggered = false;  // Ensure we only trigger once per episode

    /**
     * Load the episode lists from the external JSON file.
     * Expects a structure like:
     * {
     *    "Family Guy": { "Season 1": [url1, url2, ...], "Season 23": [url3, url4, ...] },
     *    "American Dad": { ... }
     * }
     */
    function loadEpisodeLists() {
        return fetch(chrome.runtime.getURL('episodeLists.json'))
            .then(response => response.json())
            .then(data => {
                episodeLists = data;
                // Determine which show the current URL belongs to.
                // Loop over each show and season and check if the current URL is in its list.
                let found = false;
                for (const show in episodeLists) {
                    for (const season in episodeLists[show]) {
                        if (episodeLists[show][season].includes(window.location.href)) {
                            selectedShow = show;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                console.log("Episode lists loaded. Selected show:", selectedShow);
            })
            .catch(e => {
                console.error("Error loading episode lists:", e);
            });
    }

    /**
     * Picks a random episode URL from the current show's episode lists.
     * It combines episodes from all seasons for the selected show.
     * Ensures the chosen URL is different from the current page.
     */
    function pickRandomEpisode() {
        if (!episodeLists[selectedShow]) return null;
        let allEpisodes = [];
        for (const season in episodeLists[selectedShow]) {
            allEpisodes = allEpisodes.concat(episodeLists[selectedShow][season]);
        }
        if (allEpisodes.length === 0) return null;
        const currentUrl = window.location.href;
        let randomEpisode = currentUrl;
        let attempts = 0;
        while (randomEpisode === currentUrl && attempts < 10) {
            const randomIndex = Math.floor(Math.random() * allEpisodes.length);
            randomEpisode = allEpisodes[randomIndex];
            attempts++;
        }
        return randomEpisode;
    }

    /**
     * Attaches a "timeupdate" event listener to the video element.
     */
    function attachVideoListener(video) {
        video.addEventListener("timeupdate", onTimeUpdate);
    }

    /**
     * Called on each timeupdate.
     * When the video has 40 seconds or less remaining (and if not already triggered),
     * pick a new random episode and navigate the current tab to that URL.
     */
    function onTimeUpdate(e) {
        const video = e.target;
        if (!hasTriggered && (video.duration - video.currentTime <= 40)) {
            hasTriggered = true;
            const newEpisodeUrl = pickRandomEpisode();
            console.log("Random episode selected:", newEpisodeUrl);
            if (newEpisodeUrl && newEpisodeUrl !== window.location.href) {
                window.location.replace(newEpisodeUrl);
            }
        }
    }

    /**
     * Initialize the script:
     * 1. Load the episode list.
     * 2. Wait for the video element.
     * 3. Attach the timeupdate listener.
     */
    function init() {
        loadEpisodeLists().then(() => {
            let video = document.querySelector("video");
            if (!video) {
                const intervalId = setInterval(() => {
                    video = document.querySelector("video");
                    if (video) {
                        clearInterval(intervalId);
                        attachVideoListener(video);
                    }
                }, 1000);
            } else {
                attachVideoListener(video);
            }
        });
    }

    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
