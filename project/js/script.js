import * as solarSystemMap from './solarSystemMap.js';

document.addEventListener('DOMContentLoaded', function () {
    const switchButton = document.getElementById('switchButton');
    const dashboard1 = document.getElementById('dashboard1');
    const dashboard2 = document.getElementById('dashboard2');

    let currentDashboard = 1; // Track the current dashboard

    // Initially show the first dashboard
    dashboard1.style.display = 'block';

    switchButton.addEventListener('click', function () {
        if (currentDashboard === 1) {
            dashboard1.style.display = 'none';
            dashboard2.style.display = 'block';
            currentDashboard = 2;
        } else {
            dashboard2.style.display = 'none';
            dashboard1.style.display = 'block';
            currentDashboard = 1;
        }
    });

    // Draw the solar system map in dashboard 1
    solarSystemMap.setup('#dashboard1').then(() => {
        solarSystemMap.draw().then(() => {
            console.log('Solar system map drawn');
        });
    });
});