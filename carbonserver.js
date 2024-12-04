const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const dataFile = './data.json';

// Calculate emissions
app.post('/api/calculate', (req, res) => {
    const { distance, riders, fuelType, traffic, idleTime, startTime } = req.body;
    const BASE_EMISSION = 251; // grams per km for petrol
    const IDLE_EMISSION = 10;  // grams per minute
    const NIGHTTIME_REDUCTION = 0.05;

    let fuelAdjustment = 1.0;
    if (fuelType === 'diesel') fuelAdjustment = 1.15;
    else if (fuelType === 'ev') fuelAdjustment = 0.0;

    let trafficAdjustment = 1.0;
    if (traffic === 'moderate') trafficAdjustment = 1.10;
    else if (traffic === 'heavy') trafficAdjustment = 1.20;

    let nighttimeAdjustment = 1.0;
    if (startTime >= 20 || startTime < 6) nighttimeAdjustment = 1 - NIGHTTIME_REDUCTION;

    const baseEmissions = distance * BASE_EMISSION * fuelAdjustment * trafficAdjustment * nighttimeAdjustment;
    const sharedEmissions = baseEmissions * (1 - 1 / riders);
    const idleEmissions = idleTime * IDLE_EMISSION;
    const totalEmissions = sharedEmissions + idleEmissions;

    // Save trip data
    const tripData = { distance, riders, fuelType, traffic, idleTime, startTime, totalEmissions };
    fs.appendFileSync(dataFile, JSON.stringify(tripData) + '\n');

    res.json({ totalEmissions });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
