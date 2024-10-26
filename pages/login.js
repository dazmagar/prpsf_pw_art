const { expect } = require('@playwright/test');
const helpers = require('../utils/helpers');
const config = require('../utils/config');

async function logIn(page, vuContext, events, test) {
  const email = vuContext.vars.email;
  const pass = vuContext.vars.pass;

  await test.step('logIn', async () => {
    await page.goto('/login', { timeout: config.SHORT_TIMEOUT });
    await expect(page.locator('#pyLoginForm')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleFill(page, () => page.locator('#pyLoginEmail'), email);
    await helpers.idleFill(page, () => page.locator('#pyLoginPassword'), pass);
    await helpers.idleClick(page, () => page.locator('#pyLoginFormSubmitButton'));
    await page.waitForURL('**/pipeline', { timeout: config.SHORT_TIMEOUT });
    await expect(page.getByTestId('app-sidebar')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await expect(page.locator('.avatar-button')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await expect(page.getByTestId('animation-loading')).toHaveCount(0);
  });
  events.emit('counter', 'vuser.success_login', 1);
}

module.exports = { logIn };
