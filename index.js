const express = require('express');
const { isMobilePhone } = require('validator')

const { connect } = require('./db/connect');
const User = require('./db/schemas/User');

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

app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if(!(isMobilePhone(phoneNumber, ['es-CO']) )) throw 'Is not a phone number'
    if(!(await isRegistered(phoneNumber))) throw 'Not registered'
    const code = Math.round(Math.random()*999999).toString().padStart(6,"0");
    await User.updateOne({ phoneNumber }, { phoneNumber, codeInfo: { code, generatedAt: Date.now() } }, { upsert: true });
    
    res.json("OK")
  } catch (e) {
    error(e);
    res.json(e);
  }
  
});

app.listen(PORT, () => log(`Listen on http://localhost:${PORT}`));
