# Solar Explorer

Interactive visualization tool that allows users to explore space missions and celestial bodies within our solar system.

## Team Members

- Simón González u1528314@utah.edu

- Matthew Whitaker u1251812@utah.edu

- Sarah Khan sarah.khan@utah.edu


## Project Overview

The goal of this visualization is to provide an engaging way to learn about space exploration. It features two main dashboards:

1.  **Solar System Map:** An interactive map of the solar system, displaying planets, moons, and the trajectories of various space missions. Users can zoom, pan, and filter missions by launch date to explore the evolution of space exploration.

2.  **Data Explorer:** A dashboard with scatterplots and histograms that allows users to delve deeper into the quantitative aspects of celestial bodies and missions, exploring relationships between different variables.

## Project Website and Screencast

*   [Website](https://dataviscourse2024.github.io/group-project-astronomy-visualization-2/)
*   [Screencast Video](https://www.youtube.com/watch?v=8MEvtGncpBU)

## Repository Contents

The repository contains the following folders:
*  **`docs/`:**  Contains the process book, project proposal and related files.
*   **`data_processing/`:**  Contains python scripts used for downloading and processing the data used.
*  **`project/`:**  Contains all the code for the project.

The contents of the `project/` folder are as follows:

*   **`files/`:** Directory containing the actual json data files used in the visualization.

*  **`js/`:** Directory containing the JavaScript code. It is divided in **`vis/`** (code for the visualizations) and **`data/`** (code for importing data files and performing some transformations) directories.

## Project Structure

Some key files and directories in the project are:

*   **`index.html`:** The main HTML file for the visualization.
*   **`css/styles.css`:** The CSS file for styling the visualization.
*   **`js/script.js`:** The main JavaScript file that handles the overall logic and interaction between components.
*   **`js/vis/solar-system-map/solarSystemMap.js`:**  JavaScript module for the solar system map visualization.
*   **`js/vis/scatter-hist-dashboard/dashboard.js`:** JavaScript module for the Data Explorer.

## Libraries Used

*   **D3.js:**  A JavaScript library for manipulating the DOM and creating interactive visualizations.

## Non-Obvious Features

*   **Accurate Planet Positions Toggle:**  In the solar system map, users can toggle between displaying accurate planet positions at the selected date in the slider, or keep the planets static. 
*   **Interactive Tooltips:** Hovering over planets, moons, and mission paths reveals detailed information in tooltips.
*   **Selection Highlighting:** Selecting objects in the Data Explorer highlights the corresponding objects in the solar system map, and vice versa, allowing users to explore connections between different aspects of the data.
*   **Variable Selection:** In the Data Explorer, users can dynamically choose which variables to display on the scatterplots and histograms, tailoring the exploration to their interests.

## Running the Visualization locally

1.  Clone this repository to your local machine.
2.  If you have `python` and `http.server` installed, you can run a local server by executing the `project/run.sh` script or equivalent command in your terminal.

## Data Sources

*   [General Catalog of Artificial Space Objects (GCAT)](https://planet4589.org/space/gcat/index.html)
*   [NASA Jet Propulsion Laboratory (JPL) Horizons Data System](https://ssd.jpl.nasa.gov/horizons/)
*  [Le Systeme Solaire public API](https://api.le-systeme-solaire.net/rest/bodies/)


## Test
