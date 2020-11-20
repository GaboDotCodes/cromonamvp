const express = require('express');

const { connect } = require('./db/connect');

const { log } = console;

const { PORT } = process.env;

connect();
const app = express();

const {
  phoneNumbers,
  rawNames,
  stickersTitles,
  collectionByPhone,
  isRegistered,
} = require('./utils/spreadsheet');

app.get('/', async (req, res) => {
  const phones = await isRegistered('3017014708');
  res.json(phones);
});

app.listen(PORT, () => log(`Listen on http://localhost:${PORT}`));
