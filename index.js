const express = require('express');

const { connect } = require('./db/connect');

const { log, error } = console;

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

app.post('/login', async (req, res) => {
  try {
    const phoneNumber = "3017014708"

    if(!(await isRegistered(phoneNumber))) throw new Error({ code: 300, errorMessage: 'No registrado'})
    res.json(phoneNumber)
  } catch (e) {
    error(e);
    const { code, errorMessage } = e;
    res.status(code).send({ errorMessage });
  }
  
});

app.listen(PORT, () => log(`Listen on http://localhost:${PORT}`));
