const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('./config');

function getTestUsersFromSecrets() {
  const users = [];
  let index = 1;
  const globalPassword = process.env.TEST_USER_PASSWORD || null;
  while (process.env[`TEST_USER_EMAIL_${index}`]) {
    const email = process.env[`TEST_USER_EMAIL_${index}`];
    const pass = process.env[`TEST_USER_PASSWORD_${index}`] || globalPassword;
    if (email && pass) {
      users.push({ email, pass });
    }
    index++;
  }
  return users;
}

function generateUsersCSV() {
  const users = getTestUsersFromSecrets();
  const csvFilePath = path.resolve(config.USERS);
  if (users.length === 0) {
    console.error('No test users found in environment variables');
    return;
  }
  const csvData = ['email,pass'];
  users.forEach(user => {
    csvData.push(`${user.email},${user.pass}`);
  });
  fs.writeFileSync(csvFilePath, csvData.join('\n'));
}

function getUsers(filePath) {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => {
        users.push(row);
      })
      .on('end', () => {
        resolve(users);
      })
      .on('error', error => {
        reject(error);
      });
  });
}

function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach(file => {
      const filePath = path.join(directory, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        clearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
}

function getRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function gaussianRandom(mean, stdDev) {
  let u1 = 0,
    u2 = 0;
  while (u1 === 0) {
    u1 = Math.random();
  } // Converting [0,1) to (0,1)
  while (u2 === 0) {
    u2 = Math.random();
  }
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdDev + mean;
}

async function gaussianTimeout(page, constantDelay = config.PACING_TIME_CONST, deviation = config.PACING_TIME_DEV) {
  const delay = Math.max(0, gaussianRandom(constantDelay, deviation));
  // eslint-disable-next-line
  await page.waitForTimeout(delay);
}

async function idleClick(page, getElement, options = {}, timeout = config.SHORT_TIMEOUT) {
  const element = getElement();
  await expect(element).toBeVisible({ timeout: timeout });
  await gaussianTimeout(page, config.PACING_TIME_CONST, config.PACING_TIME_DEV);
  await element.click(options);
}

async function idleDbClick(page, getElement, options = {}, timeout = config.SHORT_TIMEOUT) {
  const element = getElement();
  await expect(element).toBeVisible({ timeout: timeout });
  await gaussianTimeout(page, config.PACING_TIME_CONST, config.PACING_TIME_DEV);
  await element.dblclick(options);
}

async function idleFill(page, getElement, value, timeout = config.SHORT_TIMEOUT) {
  const element = getElement();
  await expect(element).toBeEditable({ timeout: timeout });
  await gaussianTimeout(page, config.PACING_TIME_CONST, config.PACING_TIME_DEV);
  await element.fill(value);

  const elementHandle = await element.elementHandle();
  if (elementHandle) {
    await page.evaluate(el => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }, elementHandle);
  }
  // eslint-disable-next-line
  await page.waitForTimeout(1000);
}

module.exports = {
  getUsers,
  generateUsersCSV,
  clearDirectory,
  getRandomString,
  gaussianTimeout,
  idleClick,
  idleDbClick,
  idleFill
};
