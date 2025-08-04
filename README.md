# Solar Explorer

Interactive visualization to explore space missions and celestial bodies within our solar system!

## Project Website and Screencast

*   [Website](https://simonpedrogonzalez.github.io/solar-explorer/)
*   [Screencast Video](https://www.youtube.com/watch?v=8MEvtGncpBU)

## Team Members

- Simón González u1528314@utah.edu

- Matthew Whitaker u1251812@utah.edu

- Sarah Khan sarah.khan@utah.edu


## Project Overview

The goal of this visualization is to provide an engaging way to learn about space exploration. It features two main dashboards:

1.  **Solar System Map:** An interactive map of the solar system, displaying planets, moons, and the trajectories of various space missions. Users can zoom, pan, and filter missions by launch date to explore the evolution of space exploration.

2.  **Data Explorer:** A dashboard with scatterplots and histograms that allows users to delve deeper into the quantitative aspects of celestial bodies and missions, exploring relationships between different variables.

## Non-Obvious Features

*   **Accurate Planet Positions Toggle:**  In the solar system map, users can toggle between displaying accurate planet positions at the selected date in the slider, or keep the planets static. 
*   **Interactive Tooltips:** Hovering over planets, moons, and mission paths reveals detailed information in tooltips.
*   **Selection Highlighting:** Selecting objects in the Data Explorer highlights the corresponding objects in the solar system map, and vice versa, allowing users to explore connections between different aspects of the data.
*   **Variable Selection:** In the Data Explorer, users can dynamically choose which variables to display on the scatterplots and histograms, tailoring the exploration to their interests.

## Stack

Pure js and D3.

## Data Sources

*   [General Catalog of Artificial Space Objects (GCAT)](https://planet4589.org/space/gcat/index.html)
*   [NASA Jet Propulsion Laboratory (JPL) Horizons Data System](https://ssd.jpl.nasa.gov/horizons/)
*  [Le Systeme Solaire public API](https://api.le-systeme-solaire.net/rest/bodies/)
