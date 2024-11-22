import * as solarSystemMap from './vis/solar-system-map/solarSystemMap.js';
import * as dashboard from './vis/scatter-hist-dashboard/dashboard.js';


document.addEventListener('DOMContentLoaded', function () {
    const switchButton = document.getElementById('switchButton');
    const dashboard1 = document.getElementById('dashboard1');
    const dashboard2 = document.getElementById('dashboard2');
    const timeSlider = document.getElementById('slider');
    const timeSliderText = document.getElementById('timeslider-text');
    const mapContainer = document.getElementById('map-container');

    let currentDashboard = 2;

    let firstTimeDashboard = true;
    let firstTimeMap = true;



    // dashboard.setup();
    // // Setup visualization for the first dashboard
    // solarSystemMap.setup('#map-container');


    if (currentDashboard === 1) {
        dashboard1.style.display = 'block';
        dashboard2.style.display = 'none';
        solarSystemMap.setup('#map-container');
        firstTimeMap = false;
    } else {
        dashboard2.style.display = 'block';
        dashboard1.style.display = 'none';
        dashboard.setup();
        firstTimeDashboard = false;
    }

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
            if (firstTimeDashboard) {
                dashboard.setup();
                firstTimeDashboard = false;
            }

            // // Clear the previous visualization
            // mapContainer.innerHTML = '';
            // solarSystemMap.setup('#dashboard2');
            dashboard.setup();
        } else {
            dashboard2.style.display = 'none';
            dashboard1.style.display = 'block';
            currentDashboard = 1;
            if (firstTimeMap) {
                solarSystemMap.setup('#map-container');
                firstTimeMap = false;
            }

            // // Clear the previous visualization
            // mapContainer.innerHTML = '';
            // solarSystemMap.setup('#map-container');
        }
    });
});


