const { expect } = require('@playwright/test');
const helpers = require('../utils/helpers');
const config = require('../utils/config');

async function logOut(page, vuContext, events, test) {
  await test.step('logOut', async () => {
    await helpers.idleClick(page, () => page.locator('.avatar-button'));
    await helpers.idleClick(page, () => page.locator('.ant-dropdown ul li').filter({ hasText: 'Logout' }));
    await page.waitForURL('**/login', { timeout: config.SHORT_TIMEOUT });
    await expect(page.locator('#pyLoginEmail')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await expect(page.locator('#pyLoginPassword')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
  });
  events.emit('counter', 'vuser.success_logout', 1);
}

async function createV3Document(page, vuContext, events, test, docTitle) {
  await test.step('createV3Document', async () => {
    await helpers.idleClick(page, () => page.locator('[data-testid="create-document-button"]'));
    await helpers.idleClick(page, () => page.getByTestId('create-document-button-v3'));
    await helpers.idleClick(page, () => page.getByTestId('start-from-scratch-button'));
    await page.waitForURL('**/editor/**', { timeout: config.SHORT_TIMEOUT });
    await expect(page.getByTestId('editor-page')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await expect(page.locator('.editor-right-sider')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleFill(page, () => page.getByTestId('document-title'), docTitle);
  });
  events.emit('counter', 'vuser.success_create_new_document', 1);
}

module.exports = { logOut, createV3Document };
