// Chart variables
let emissionsChart;
const emissionsData = []; // Store emissions for graph
const tripLabels = [];    // Store trip labels (e.g., Trip 1, Trip 2)

// Update Chart Function
function updateChart(emission, rideType) {
    // Add data
    emissionsData.push(emission);
    tripLabels.push(`Trip ${tripLabels.length + 1} (${rideType})`);

    // If chart exists, update it
    if (emissionsChart) {
        emissionsChart.data.labels = tripLabels;
        emissionsChart.data.datasets[0].data = emissionsData;
        emissionsChart.update();
    } else {
        // Create chart if it doesn't exist
        const ctx = document.getElementById('emissionsChart').getContext('2d');
        emissionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: tripLabels,
                datasets: [{
                    label: 'Carbon Emissions (grams)',
                    data: emissionsData,
                    backgroundColor: 'rgba(76, 175, 80, 0.6)', // Green bars
                    borderColor: 'rgba(76, 175, 80, 1)', // Green border
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Emissions (grams)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Trips'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
}

// Form Submission Handler
document.getElementById('calculateBtn').addEventListener('click', () => {
    // Collect Input Data
    const rideType = document.getElementById('rideType').value; // Ride type: car or bike
    const distance = parseFloat(document.getElementById('distance').value);
    const riders = parseInt(document.getElementById('riders').value);
    const traffic = document.getElementById('traffic').value;
    const idleTime = parseInt(document.getElementById('idleTime').value);
    const startTime = parseInt(document.getElementById('startTime').value);

    // Validate start time
    if (startTime >= 24) {
        alert("Enter a valid time (less than 24).");
        return;
    }

    if (isNaN(distance) || isNaN(riders) || isNaN(idleTime) || isNaN(startTime)) {
        alert("Please fill in all fields with valid data.");
        return;
    }

    let totalEmissions = 0;

    if (rideType === "car") {
        // Car Emissions Formula
        const fuelType = document.getElementById('fuelType').value;
        const BASE_EMISSION = 251; // grams per km for petrol
        const IDLE_EMISSION = 10;  // grams per minute
        const NIGHTTIME_REDUCTION = 0.05;

        let fuelAdjustment = fuelType === 'diesel' ? 1.15 : 1.0;
        let trafficAdjustment = traffic === 'moderate' ? 1.1 : traffic === 'heavy' ? 1.2 : 1.0;
        let nighttimeAdjustment = (startTime >= 20 || startTime < 6) ? 1 - NIGHTTIME_REDUCTION : 1.0;

        const baseEmissions = distance * BASE_EMISSION * fuelAdjustment * trafficAdjustment * nighttimeAdjustment;
        const sharedEmissions = baseEmissions * (1 - 1 / riders);
        const idleEmissions = idleTime * IDLE_EMISSION;

        totalEmissions = sharedEmissions + idleEmissions;

    } else if (rideType === "bike") {
        // Bike Emissions Formula
        const BIKE_EMISSION = 20; // Average grams per km for motorized bikes
        totalEmissions = distance * BIKE_EMISSION;
    }

    // Display Result
    document.getElementById('result').innerText = 
        `Estimated Carbon Emissions (${rideType}): ${totalEmissions.toFixed(2)} grams`;

    // Update Chart
    updateChart(totalEmissions, rideType);
});
