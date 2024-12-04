// Chart variables
let emissionsChart;
const emissionsData = []; // Store emissions for graph
const tripLabels = [];    // Store trip labels (e.g., Trip 1, Trip 2)

// Update Chart Function
function updateChart(emission) {
    // Add data
    emissionsData.push(emission);
    tripLabels.push(`Trip ${tripLabels.length + 1}`);

    // If chart exists, update it
    if (emissionsChart) {
        emissionsChart.data.labels = tripLabels;
        emissionsChart.data.datasets[0].data = emissionsData;
        emissionsChart.update();
    } else {
        // Create chart if it doesn't exist
        emissionsChart = new Chart(document.getElementById('emissionsChart'), {
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
document.getElementById('carbonForm').addEventListener('submit', (event) => {
    event.preventDefault();

    // Collect Input Data
    const distance = parseFloat(document.getElementById('distance').value);
    const riders = parseInt(document.getElementById('riders').value);
    const fuelType = document.getElementById('fuelType').value;
    const traffic = document.getElementById('traffic').value;
    const idleTime = parseInt(document.getElementById('idleTime').value);
    const startTime = parseInt(document.getElementById('startTime').value);

    // Calculate Emissions
    const BASE_EMISSION = 251; // grams per km
    const IDLE_EMISSION = 10;  // grams per minute
    const NIGHTTIME_REDUCTION = 0.05;

    let fuelAdjustment = fuelType === 'diesel' ? 1.15 : fuelType === 'ev' ? 0 : 1.0;
    let trafficAdjustment = traffic === 'moderate' ? 1.1 : traffic === 'heavy' ? 1.2 : 1.0;
    let nighttimeAdjustment = (startTime >= 20 || startTime < 6) ? 1 - NIGHTTIME_REDUCTION : 1.0;

    let baseEmissions = distance * BASE_EMISSION * fuelAdjustment * trafficAdjustment * nighttimeAdjustment;
    let sharedEmissions = baseEmissions * (1 - 1 / riders);
    let idleEmissions = idleTime * IDLE_EMISSION;
    let totalEmissions = sharedEmissions + idleEmissions;

    // Display Result
    document.getElementById('result').innerText = `Estimated Carbon Emissions: ${totalEmissions.toFixed(2)} grams`;

    // Update Chart
    updateChart(totalEmissions);
});
