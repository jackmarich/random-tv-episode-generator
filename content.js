/**
 * AutoPlayNext - A script that automatically switches to a random episode
 * when the current episode is about to end.
 *
 * This immediately-invoked function expression (IIFE) creates a private scope
 * to avoid polluting the global namespace.
 */
(function () {
    // Stores all available episodes organized by show and season
    let episodeLists = {};
    // The show currently being watched (defaults to "Family Guy")
    let selectedShow = "Family Guy";
    // Flag to ensure we only trigger one episode switch per video
    let hasTriggered = false;

    /**
     * Loads episode lists from the extension's JSON file.
     * 
     * The JSON file should be structured as:
     * {
     *   "Show Name": {
     *     "Season X": ["url1", "url2", ...],
     *     "Season Y": ["url3", "url4", ...]
     *   },
     *   "Another Show": { ... }
     * }
     * 
     * @returns {Promise} A promise that resolves when episode lists are loaded
     */
    function loadEpisodeLists() {
        return fetch(chrome.runtime.getURL('episodeLists.json'))
            .then(response => response.json())
            .then(data => {
                episodeLists = data;

                // Determine which show the current URL belongs to
                let found = false;
                const currentUrl = window.location.href;

                for (const show in episodeLists) {
                    for (const season in episodeLists[show]) {
                        if (episodeLists[show][season].includes(currentUrl)) {
                            selectedShow = show;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }

                console.log(`Episode lists loaded. Selected show: ${selectedShow}`);
            })
            .catch(error => {
                console.error("Error loading episode lists:", error);
            });
    }

    /**
     * Selects a random episode from the current show.
     * Ensures the selected episode is different from the current one.
     * 
     * @returns {string|null} URL of a random episode, or null if none available
     */
    function pickRandomEpisode() {
        // Check if we have episodes for the selected show
        if (!episodeLists[selectedShow]) {
            console.error(`No episodes found for ${selectedShow}`);
            return null;
        }

        // Combine all episodes from all seasons for the selected show
        let allEpisodes = [];
        for (const season in episodeLists[selectedShow]) {
            allEpisodes = allEpisodes.concat(episodeLists[selectedShow][season]);
        }

        // Ensure we have episodes to choose from
        if (allEpisodes.length === 0) {
            console.error(`No episodes available for ${selectedShow}`);
            return null;
        }

        // Pick a random episode different from the current one
        const currentUrl = window.location.href;
        let randomEpisode = currentUrl;
        let attempts = 0;
        const maxAttempts = 10;

        while (randomEpisode === currentUrl && attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * allEpisodes.length);
            randomEpisode = allEpisodes[randomIndex];
            attempts++;
        }

        // If we couldn't find a different episode after multiple attempts, log it
        if (randomEpisode === currentUrl) {
            console.warn(`Could not find a different episode after ${maxAttempts} attempts`);
        }

        return randomEpisode;
    }

    /**
     * Attaches a "timeupdate" event listener to the video element.
     * 
     * @param {HTMLVideoElement} video - The video element to monitor
     */
    function attachVideoListener(video) {
        console.log("Video listener attached");
        video.addEventListener("timeupdate", onTimeUpdate);
    }

    /**
     * Handles the "timeupdate" event from the video element.
     * When 40 seconds or less remain in the video, triggers navigation to a new episode.
     * 
     * @param {Event} event - The timeupdate event
     */
    function onTimeUpdate(event) {
        const video = event.target;
        const remainingTime = video.duration - video.currentTime;

        // If debugging is needed, uncomment this:
        // if (Math.floor(remainingTime) % 10 === 0) {
        //     console.log(`Remaining time: ${remainingTime.toFixed(2)} seconds`);
        // }

        if (!hasTriggered && remainingTime <= 40 && remainingTime > 0) {
            hasTriggered = true;
            console.log(`Triggering new episode with ${remainingTime.toFixed(2)} seconds remaining`);

            const newEpisodeUrl = pickRandomEpisode();

            if (newEpisodeUrl && newEpisodeUrl !== window.location.href) {
                console.log(`Navigating to new episode: ${newEpisodeUrl}`);
                window.location.replace(newEpisodeUrl);
            } else {
                console.error("Failed to navigate to a new episode");
            }
        }
    }

    /**
     * Waits for the video element to be available in the DOM.
     * 
     * @returns {Promise} A promise that resolves with the video element
     */
    function waitForVideo() {
        return new Promise(resolve => {
            // Check if video already exists
            let video = document.querySelector("video");
            if (video) {
                console.log("Video element found immediately");
                resolve(video);
                return;
            }

            // If not, set up an interval to check periodically
            console.log("Waiting for video element...");
            const intervalId = setInterval(() => {
                video = document.querySelector("video");
                if (video) {
                    console.log("Video element found");
                    clearInterval(intervalId);
                    resolve(video);
                }
            }, 1000);
        });
    }

    /**
     * Initializes the extension:
     * 1. Loads the episode lists
     * 2. Waits for the video element
     * 3. Attaches event listeners
     */
    function init() {
        console.log("Initializing AutoPlayNext extension");
        loadEpisodeLists()
            .then(() => waitForVideo())
            .then(video => {
                attachVideoListener(video);
            })
            .catch(error => {
                console.error("Initialization error:", error);
            });
    }

    // Start the initialization process when the DOM is ready
    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();