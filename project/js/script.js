import * as solarSystemMap from './vis/solar-system-map/solarSystemMap.js';
import * as scatterPlot from './vis/scatterPlot.js';

document.addEventListener('DOMContentLoaded', function () {
    const switchButton = document.getElementById('switchButton');
    const dashboard1 = document.getElementById('dashboard1');
    const dashboard2 = document.getElementById('dashboard2');

    let currentDashboard = 1; 

    dashboard1.style.display = 'block';
    dashboard2.style.display = 'none'; // Initially hide dashboard 2

    
    switchButton.addEventListener('click', function () {
        if (currentDashboard === 1) {
            dashboard1.style.display = 'none';
            dashboard2.style.display = 'block';
            currentDashboard = 2;

             // *** Add the background image setting here ***
             dashboard2.style.backgroundImage = "url('https://www.solarsystemscope.com/images/background_stars_grid.jpg')"; 

            
            scatterPlot.setup('#dashboard2').then(() => { // Call setup when shown
                scatterPlot.draw();
            });
        } else {
            dashboard2.style.display = 'none';
            dashboard1.style.display = 'block';
            currentDashboard = 1;
        }
    });

    solarSystemMap.setup('#dashboard1');

});