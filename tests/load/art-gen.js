const fs = require('fs');
const path = require('path');
const config = require('../../utils/config');
const { clearDirectory } = require('../../utils/helpers');

const usersFilePath = path.resolve(process.cwd(), config.USERS);
const indexPath = path.resolve(process.cwd(), './pages/index.js');
const resultsDir = path.resolve(process.cwd(), 'test-results');
const screenshotsDir = path.resolve(resultsDir, 'screenshots');
const reportFilePath = path.join(resultsDir, 'artillery-report.json');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

clearDirectory(resultsDir);

// Generate phases based on the config
let phases = '';

Object.keys(config.LOAD_TEST_PHASES).forEach(phaseKey => {
  const phase = config.LOAD_TEST_PHASES[phaseKey];

  // Ensure only one of T_ARRIVAL_COUNT or T_ARRIVAL_RATE is set
  const hasArrivalCount = phase.T_ARRIVAL_COUNT > 0;
  const hasArrivalRate = phase.T_ARRIVAL_RATE > 0;

  if (hasArrivalCount && hasArrivalRate) {
    console.error(`Error: Both T_ARRIVAL_COUNT and T_ARRIVAL_RATE are set for phase ${phaseKey}. Only one should be set.`);
    process.exit(1);
  } else if (!hasArrivalCount && !hasArrivalRate) {
    console.error(`Error: Neither T_ARRIVAL_COUNT nor T_ARRIVAL_RATE is set for phase ${phaseKey}. One must be set.`);
    process.exit(1);
  }

  // Generate the phase based on which parameter is set
  if (hasArrivalCount) {
    const arrivalInterval = (phase.T_DURATION / phase.T_ARRIVAL_COUNT).toFixed(2);
    phases += `
  - duration: ${phase.T_DURATION}
    arrivalCount: ${phase.T_ARRIVAL_COUNT}
    name: "Phase ${phaseKey}: 1 VU every ${arrivalInterval} seconds. Total VU: ${phase.T_ARRIVAL_COUNT}"`;
  } else if (hasArrivalRate) {
    phases += `
  - duration: ${phase.T_DURATION}
    arrivalRate: ${phase.T_ARRIVAL_RATE}
    name: "Phase ${phaseKey}: ${phase.T_ARRIVAL_RATE} VU per second"`;
  }
});

const pipeline = `
config:
  target: ${config.BASE_URL}
  phases:${phases}
  payload:
    path: ${usersFilePath}
    order: "sequence"
    skipHeader: true
    fields:
      - "email"
      - "pass"
  engines:
    playwright:
      aggregateByName: true
      launchOptions:
        headless: ${config.IS_HEADLESS}
        timeout: 240000

  processor: ${indexPath}
  output: ${reportFilePath}

scenarios:
  - name: 'loadFlow'
    engine: playwright
    testFunction: "loadFlow"
`;

const tempConfigPath = path.join(__dirname, 'temp-artillery.yml');
fs.writeFileSync(tempConfigPath, pipeline);
