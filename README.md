# Random TV Episode Generator

This Chrome extension allows you to randomly select and play TV show episodes from a list of available shows and seasons. It also includes an autoplay feature that automatically switches to a new random episode when the current one finishes.

NOTE: As you will see, this project was created by manually adding each episode link to a list on a .json file, as I was struggling to find a way to find the correct attributes to each season and episode listing. If you know a better way, please reach out. Thank you!

## Features

* **Random Episode Selection:** Choose a TV show and optionally select specific seasons to generate a random episode.
* **Autoplay:** Automatically switch to a new random episode when the current episode is about to end on Hulu.
* **User-Friendly Interface:** Simple and intuitive popup interface for easy episode selection.
* **Show and Season Management:** Easily manage and update the list of available shows and seasons in the `episodeLists.json` file.

## Installation

1.  **Download or Clone the Repository:** Download the ZIP file of this repository or clone it using Git.
2.  **Enable Developer Mode in Chrome:**
    * Open Chrome and go to `chrome://extensions/`.
    * Toggle the "Developer mode" switch in the top right corner.
3.  **Load Unpacked Extension:**
    * Click the "Load unpacked" button.
    * Select the directory where you extracted or cloned the repository.
4.  **Pin the Extension:** Pin the extension to your toolbar for easy access.

## Usage

1.  **Open the Popup:** Click the extension icon in your Chrome toolbar to open the popup window.
2.  **Select a Show:** Choose a TV show from the dropdown menu.
3.  **Choose Selection Mode:**
    * "All Episodes": Selects a random episode from all available seasons.
    * "Selected Seasons": Allows you to choose specific seasons.
4.  **Select Seasons (if applicable):** If you chose "Selected Seasons" mode, check the boxes next to the seasons you want to include.
5.  **Pick Random Episode:** Click the "Pick Random Episode" button. A new tab will open with the randomly selected episode.
6.  **Autoplay:** When watching an episode on Hulu, the extension will automatically switch to a new random episode when the current episode is about to end.

## File Structure

* `manifest.json`: The extension manifest file, defining the extension's metadata and permissions.
* `popup.html`: The HTML file for the extension's popup window.
* `popup.css`: The CSS file for styling the popup window.
* `popup.js`: The JavaScript file for the popup window's functionality.
* `content.js`: The JavaScript file for the content script, handling the autoplay feature on Hulu.
* `episodeLists.json`: A JSON file containing the list of available shows, seasons, and episode URLs.
* `icons/`: Directory containing the extension's icons.

## `episodeLists.json` Format

The `episodeLists.json` file should be structured as follows:

```json
{
  "Show Name": {
    "Season 1": [
      "episode_url1",
      "episode_url2",
      "..."
    ],
    "Season 2": [
      "episode_url3",
      "episode_url4",
      "..."
    ],
    "..."
  },
  "Another Show": {
    "..."
  },
  "..."
}
```

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.   
5. Submit a pull request.

## License
This project is open source.

## Contact
If you have any questions or suggestions, please feel free to contact me.