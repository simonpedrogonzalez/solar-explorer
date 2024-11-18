import * as solarSystemMap from './vis/solar-system-map/solarSystemMap.js';

document.addEventListener('DOMContentLoaded', function () {
    const switchButton = document.getElementById('switchButton');
    const dashboard1 = document.getElementById('dashboard1');
    const dashboard2 = document.getElementById('dashboard2');
    const timeSlider = document.getElementById('slider');
    const timeSliderText = document.getElementById('timeslider-text');
    const mapContainer = document.getElementById('map-container');

    let currentDashboard = 1;

    // Initial setup
    dashboard1.style.display = 'block';
    dashboard2.style.display = 'none';

    // Time slider event
    timeSlider.addEventListener('input', () => {
        timeSliderText.textContent = timeSlider.value;
    });

    // Switch dashboards
    switchButton.addEventListener('click', function () {
        if (currentDashboard === 1) {
            dashboard1.style.display = 'none';
            dashboard2.style.display = 'block';
            currentDashboard = 2;

            // Clear the previous visualization
            mapContainer.innerHTML = '';
            solarSystemMap.setup('#dashboard2');
        } else {
            dashboard2.style.display = 'none';
            dashboard1.style.display = 'block';
            currentDashboard = 1;

            // Clear the previous visualization
            mapContainer.innerHTML = '';
            solarSystemMap.setup('#map-container');
        }
    });

    // Setup visualization for the first dashboard
    solarSystemMap.setup('#map-container');
});
