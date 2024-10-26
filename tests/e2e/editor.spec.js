const { test, expect } = require('@playwright/test');
const { logIn, createV3Document, addTable, fillTable, extractTableData, rearrangeTableRows, addImage, getImageDimensions, resizeImage, logOut } = require('../../pages/index');
const { getUsers, getRandomString } = require('../../utils/helpers');
const config = require('../../utils/config');

let vuContext;
let events;
let testHelper;

test.beforeEach(async ({ page }) => {
  const users = await getUsers(config.USERS);

  vuContext = {
    vars: {
      email: users[0].email,
      pass: users[0].pass
    }
  };

  events = {
    emit: () => {}
  };

  testHelper = {
    step: async (name, fn) => {
      await fn();
    }
  };

  await logIn(page, vuContext, events, testHelper);
});

test.describe('Editor', () => {
  test('Verify the rows of a table is reordered', async ({ page }) => {
    await createV3Document(page, vuContext, events, testHelper, `Table_${getRandomString(5)}`);

    await addTable(page, vuContext, events, testHelper, 'Text Table');

    const tableData = {
      0: { 1: 'Header: Column1', 2: 'Header: Column2' },
      1: { 1: 'Row1:Column1', 2: 'Row1:Column2' },
      2: { 1: 'Row2:Column1', 2: 'Row2:Column2' }
    };
    await fillTable(page, vuContext, events, testHelper, tableData);

    const tableDataBefore = await extractTableData(page, vuContext, events, testHelper);

    await rearrangeTableRows(page, vuContext, events, testHelper, 1, 2);

    const tableDataAfter = await extractTableData(page, vuContext, events, testHelper);

    expect(tableDataAfter[1]).toEqual(tableDataBefore[2]);
    expect(tableDataAfter[2]).toEqual(tableDataBefore[1]);
    expect(tableDataAfter[0]).toEqual(tableDataBefore[0]);

    await logOut(page, vuContext, events, testHelper);
  });

  test('Verify an image is resized', async ({ page }) => {
    await createV3Document(page, vuContext, events, testHelper, `Image_${getRandomString(5)}`);

    await addImage(page, vuContext, events, testHelper, 'resources/DSC_8756.jpg');

    const imgDimensionsBefore = await getImageDimensions(page, vuContext, events, test);

    const expectedWidth = '166.4';
    const expectedHeight = '250';

    await resizeImage(page, vuContext, events, test, expectedWidth, expectedHeight);

    const imgDimensionsAfter = await getImageDimensions(page, vuContext, events, test);

    expect(Math.round(imgDimensionsAfter.width)).not.toBe(Math.round(imgDimensionsBefore.width));
    expect(Math.round(imgDimensionsAfter.height)).not.toBe(Math.round(imgDimensionsBefore.height));

    expect(Math.round(imgDimensionsAfter.width)).toBe(Math.round(expectedWidth));
    expect(Math.round(imgDimensionsAfter.height)).toBe(Math.round(expectedHeight));

    await logOut(page, vuContext, events, testHelper);
  });
});
