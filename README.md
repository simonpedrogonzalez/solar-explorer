group-project-astronomy-visualization-2

# Solar Explorer

This repository contains the code and documentation for "Space Mission Explorer," an interactive visualization tool that allows users to explore space missions and celestial bodies within our solar system.

## Team Members

- Matthew Whitaker u1251812@utah.edu

- Sarah Khan sarah.khan@utah.edu

- Simón González u1528314@utah.edu



## Project Overview

"Space Mission Explorer" provides a dynamic and engaging way to learn about space exploration. It features two main dashboards:

1.  **Solar System Map:** An interactive map of the solar system, displaying planets, moons, and the trajectories of various space missions. Users can zoom, pan, and filter missions by launch date to explore the evolution of space exploration.

2.  **Data Explorer:** A dashboard with scatterplots and histograms that allows users to delve deeper into the quantitative aspects of celestial bodies and missions, exploring relationships between different variables.

## Project Website and Screencast

*   **Website:** [Insert website URL]
*   **Screencast Video:** [Insert screencast video URL]

## Repository Contents

*   **`index.html`:** The main HTML file for the visualization.
*   **`css/styles.css`:** The CSS file for styling the visualization.
*   **`js/script.js`:** The main JavaScript file that handles the overall logic and interaction between components.
*   **`js/vis/solar-system-map/solarSystemMap.js`:**  JavaScript module for the solar system map visualization.
*   **`js/vis/scatter-hist-dashboard/dashboard.js`:** JavaScript module for the Data Explorer.
*   **`data/`:**  Directory containing the data files used in the visualization (in JSON format).
*   **`process_data.py`:** Python script used for data cleaning and processing.
*   **`calculate_planetary_positions.py`:** Python script used to calculate accurate planetary positions.
*   **`process-book.pdf`:**  The process book documenting the project's development.
*   **`README.md`:** This README file.

## Libraries Used

*   **D3.js:**  A JavaScript library for manipulating the DOM and creating interactive visualizations.

## Non-Obvious Features

*   **Accurate Planet Positions Toggle:**  In the solar system map, users can toggle between displaying approximate and accurate planet positions. 
*   **Interactive Tooltips:** Hovering over planets, moons, and mission paths reveals detailed information in tooltips, providing understanding of the data.
*   **Selection Highlighting:** Selecting objects in the Data Explorer highlights the corresponding objects in the solar system map, and vice versa, allowing users to explore connections between different aspects of the data.
*   **Variable Selection:** In the Data Explorer, users can dynamically choose which variables to display on the scatterplots and histograms, tailoring the exploration to their interests.

## Running the Visualization

1.  Clone this repository to your local machine.
2.  Open the `index.html` file in your web browser.

