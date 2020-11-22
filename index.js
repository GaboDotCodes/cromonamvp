const express = require('express');
const { isMobilePhone } = require('validator');

const generateWhatsappLink = require('./utils/generateWhatsappLink');
const shortUrl = require('./utils/shortUrl');
const sendSMS = require('./utils/sendSMS');

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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.post('/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if(!(isMobilePhone(phoneNumber, ['es-CO']) )) throw 'Is not a phone number'
    if(!(await isRegistered(phoneNumber))) throw 'Not registered'
    const code = Math.round(Math.random()*999999).toString().padStart(6,"0");
    await User.updateOne({ phoneNumber }, { phoneNumber, codeInfo: { code, generatedAt: Date.now() } }, { upsert: true });
    const longUrl = generateWhatsappLink(phoneNumber,`${code} es tú código para Cromona.co`,'57');
    const toSendSMS = await shortUrl(longUrl);
    log(toSendSMS)
    res.json("OK")
  } catch (e) {
    error(e);
    res.json(e);
  }
  
});

app.listen(PORT, () => log(`Listen on http://localhost:${PORT}`));
