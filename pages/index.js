const { logIn } = require('./login');
const { createV3Document, logOut } = require('./dashboard');
const { addTable, fillTable, extractTableData, rearrangeTableRows, addImage, getImageDimensions, resizeImage } = require('./editor');
const { getRandomString } = require('../utils/helpers');

async function loadFlow(page, vuContext, events, test) {
  const email = vuContext.vars.email;
  const username = email.split('@')[0];

  console.log(`[START] VU===>${username}`);
  await logIn(page, vuContext, events, test);
  await createV3Document(page, vuContext, events, test, getRandomString(5));
  await logOut(page, vuContext, events, test);
  console.log(`[END] VU===>${username}`);
}

module.exports = {
  logIn,
  logOut,
  createV3Document,
  addTable,
  fillTable,
  extractTableData,
  rearrangeTableRows,
  addImage,
  getImageDimensions,
  resizeImage,
  loadFlow
};
