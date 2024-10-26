const { test } = require('@playwright/test');
const { logIn, createV3Document, logOut } = require('../../pages/index');
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

test.describe('Demo', () => {
  test('Verify login, create v3 document, and logout', async ({ page }) => {
    await createV3Document(page, vuContext, events, test, getRandomString(5));

    await logOut(page, vuContext, events, test);
  });
});
