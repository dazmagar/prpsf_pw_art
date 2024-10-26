const { expect } = require('@playwright/test');
const path = require('path');
const helpers = require('../utils/helpers');
const config = require('../utils/config');

async function addTable(page, vuContext, events, test, tableType) {
  await test.step('addTable', async () => {
    await helpers.idleClick(page, () => page.locator('[data-node-key="content_tab"]'));
    await expect(page.locator('[role="tabpanel"] button').filter({ hasText: 'Table' })).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleClick(page, () => page.locator('[role="tabpanel"] button').filter({ hasText: 'Table' }));
    let buttonTestId;
    if (tableType === 'Text Table') {
      buttonTestId = '[data-testid="text-table-block-button"]';
    } else if (tableType === 'Pricing Table') {
      buttonTestId = '[data-testid="pricing-table-block-button"]';
    } else {
      throw new Error(`Unknown table type: ${tableType}`);
    }
    await expect(page.locator(buttonTestId)).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await page.dragAndDrop(buttonTestId, '.file-drop-background', { sourcePosition: { x: 30, y: 30 }, targetPosition: { x: 50, y: 50 } });
  });
  events.emit('counter', 'vuser.success_add_table', 1);
}

async function fillTable(page, vuContext, events, test, tableData) {
  await test.step('fillTable', async () => {
    await expect(page.getByTestId('table-block-test-id')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleDbClick(page, () => page.getByTestId('table-block-test-id'), { force: true });
    expect(await page.locator('[data-testid="table-block-test-id"] [data-testid="DragIcon"]').count()).toBeGreaterThan(0);
    for (const [rowIndex, columns] of Object.entries(tableData)) {
      const rowLocator = `[data-testid="table-block-test-id"] [data-rowindex='${rowIndex}']`;
      for (const [columnIndex, value] of Object.entries(columns)) {
        const columnLocator = `${rowLocator} [data-field='column${columnIndex}']`;
        await helpers.idleDbClick(page, () => page.locator(columnLocator), { force: true });
        const inputLocator = `${columnLocator} input`;
        await helpers.idleFill(page, () => page.locator(inputLocator), value);
      }
    }
    await helpers.idleClick(page, () => page.locator('.file-drop-background'), { position: { x: 3, y: 3 } });
    await expect(page.locator('[data-testid="table-block-test-id"] [data-testid="DragIcon"]')).toHaveCount(0);
  });
  events.emit('counter', 'vuser.success_fill_table', 1);
}

async function extractTableData(page, vuContext, events, test) {
  const tableData = {};
  await test.step('extractTableData', async () => {
    const rowCount = await page.locator('[data-testid="table-block-test-id"] [role="grid"]').getAttribute('aria-rowcount');
    const columnCount = await page.locator('[data-testid="table-block-test-id"] [role="grid"]').getAttribute('aria-colcount');
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowLocator = `[data-testid="table-block-test-id"] [data-rowindex="${rowIndex}"]`;
      const isVisible = await page.locator(rowLocator).isVisible();
      if (!isVisible) {
        continue;
      }
      tableData[rowIndex] = {};
      for (let colIndex = 1; colIndex <= columnCount; colIndex++) {
        const cellLocator = `${rowLocator} [data-field="column${colIndex}"]`;
        const cellValue = await page.locator(cellLocator).innerText();
        tableData[rowIndex][colIndex] = cellValue;
      }
    }
  });
  events.emit('counter', 'vuser.success_extract_table_data', 1);
  return tableData;
}

async function rearrangeTableRows(page, vuContext, events, test, fromRowIndex, toRowIndex) {
  await test.step('extractTableData', async () => {
    await expect(page.getByTestId('table-block-test-id')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    const rowCount = parseInt(await page.locator('[data-testid="table-block-test-id"] [role="grid"]').getAttribute('aria-rowcount'));
    if (fromRowIndex >= rowCount || toRowIndex >= rowCount || fromRowIndex < 0 || toRowIndex < 0) {
      throw new Error(`Invalid row indices. fromRowIndex: ${fromRowIndex}, toRowIndex: ${toRowIndex}, rowCount: ${rowCount}`);
    }
    await helpers.idleDbClick(page, () => page.getByTestId('table-block-test-id'), { force: true });
    expect(await page.locator('[data-testid="table-block-test-id"] [data-testid="DragIcon"]').count()).toBeGreaterThan(0);
    const fromRowLocator = `[data-testid="table-block-test-id"] [data-rowindex="${fromRowIndex}"] [data-testid="DragIcon"]`;
    const toRowLocator = `[data-testid="table-block-test-id"] [data-rowindex="${toRowIndex}"] [data-testid="DragIcon"]`;
    await page.dragAndDrop(fromRowLocator, toRowLocator);
    // eslint-disable-next-line
    await page.waitForTimeout(2000);
    await helpers.idleClick(page, () => page.locator('.file-drop-background'), { position: { x: 3, y: 3 } });
    // eslint-disable-next-line
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="table-block-test-id"] [data-testid="DragIcon"]')).toHaveCount(0);
  });
  events.emit('counter', 'vuser.success_rearrange_table_rows', 1);
}

async function addImage(page, vuContext, events, test, imageFile) {
  await test.step('addImage', async () => {
    await helpers.idleClick(page, () => page.locator('[data-node-key="content_tab"]'));
    await expect(page.locator('[role="tabpanel"] button').filter({ hasText: 'Image' })).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleClick(page, () => page.locator('[role="tabpanel"] button').filter({ hasText: 'Image' }));
    await expect(page.locator('.image__content__section')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    const fileInput = page.locator('.image__content__section input[data-testid="file-input"]');
    const filePath = path.resolve(process.cwd(), imageFile);
    await fileInput.setInputFiles(filePath);
    await expect(page.locator('.image__content__section ul li img')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await page.dragAndDrop('.image__content__section ul li img', '.file-drop-background', { sourcePosition: { x: 30, y: 30 }, targetPosition: { x: 50, y: 50 } });
  });
  events.emit('counter', 'vuser.success_add_image', 1);
}

async function getImageDimensions(page, vuContext, events, test) {
  let dimensions;
  await test.step('getImageDimensions', async () => {
    await expect(page.locator('[data-testid="image-block"] [class*="block_"]')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    const element = page.locator('[data-testid="image-block"] [class*="block_"]');
    const width = await element.evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const height = await element.evaluate(el => parseFloat(window.getComputedStyle(el).height));
    dimensions = { width: width, height: height };
  });
  events.emit('counter', 'vuser.success_get_image_dimensions', 1);
  return dimensions;
}

async function resizeImage(page, vuContext, events, test, width, height) {
  await test.step('resizeImage', async () => {
    await expect(page.locator('[data-testid="image-block"] [class*="block_"]')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleClick(page, () => page.locator('[data-testid="image-block"] [class*="block-settings"] [data-testid="IMAGE-settings-icon"]'));
    await expect(page.getByTestId('image-block-settings-component')).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await helpers.idleFill(page, () => page.locator('[data-testid="image-block-settings-component"] [data-testid="image-width-input"] input'), width);
    await helpers.idleFill(page, () => page.locator('[data-testid="image-block-settings-component"] [data-testid="image-height-input"] input'), height);
  });
  events.emit('counter', 'vuser.success_resize_image', 1);
}

module.exports = { addTable, fillTable, extractTableData, rearrangeTableRows, addImage, getImageDimensions, resizeImage };
