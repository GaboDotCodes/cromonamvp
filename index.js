const express = require('express');
const jwt = require('jsonwebtoken')
const { isMobilePhone } = require('validator');

const { generateWhatsappLink } = require('./utils/generateWhatsappLink');
const { shortUrl } = require('./utils/shortUrl');
const { sendSMS } = require('./utils/sendSMS');
const { compareCollections } = require('./utils/compareCollections');
const { distanceAB } = require('./utils/distanceAB');
const {
  isRegistered,
  collectionByPhone,
  nameByPhone,
  names
} = require('./utils/spreadsheet');

const { connect } = require('./db/connect');
const { User } = require('./db/schemas/User');

const { log, error } = console;

const { PORT, JWT_SECRET, RATIO_DISTANCE } = process.env;

connect();
const app = express();

function sortByAmountSwaps(a, b) {
  const aAmount = a.amountSwaps;
  const bAmount = b.amountSwaps;

  let comparison = 0;
  if (aAmount < bAmount) {
    comparison = 1;
  } else if (aAmount > bAmount) {
    comparison = -1;
  }
  return comparison;
}

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
    if (!(isMobilePhone(phoneNumber, ['es-CO']))) throw 'Is not a phone number'
    if (!(await isRegistered(phoneNumber))) throw 'Not registered'
    const code = Math.round(Math.random() * 9999).toString().padStart(4, "0");
    await User.updateOne({ phoneNumber }, { phoneNumber, codeInfo: { code, generatedAt: Date.now() } }, { upsert: true });
    const longUrl = generateWhatsappLink(phoneNumber, `${code} es tú código para Cromona.co`, '57');
    const shortedUrl = await shortUrl(longUrl);
    const finish = await sendSMS(`REGISTER: ${shortedUrl}`, '3136109241');
    res.json("OK");
  } catch (e) {
    error(e);
    res.json(e);
  }
});

app.post('/verifycode', async (req, res) => {
  try {
    const { phoneNumber, code, lat, lon } = req.body;
    if (!(isMobilePhone(phoneNumber, ['es-CO']))) throw 'Is not a phone number'
    const user = await User.findOne({ phoneNumber });
    await User.updateOne({ phoneNumber }, { verified: true, codeInfo: undefined });
    if (!lat && !lon) throw 'Missing GPS'
    await User.updateOne({ phoneNumber }, { location: { lat, lon } });
    if (!user) throw 'Login first'
    const loginMoment = user.codeInfo.generatedAt;
    if ((Date.now() - loginMoment) > 600000) throw 'Too late'
    const codedb = user.codeInfo.code;
    if (code.length !== 4) throw 'Wrong code length'
    if (code !== codedb) throw 'Wrong code'
    const payload = { phoneNumber };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: 1440
    });
    res.json({ token });
  } catch (e) {
    error(e);
    res.json(e);
  }
});

app.get('/getswaps/:phoneNumber', async (req, res) => {
  try {
    const token = req.headers['access-token'];
    const { phoneNumber } = req.params;
    if (!token) throw 'Token not found'
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) throw 'Invalid token'
      if (decoded.phoneNumber !== phoneNumber) throw 'Do not change the phonenumber'
    });
    const myCollection = await collectionByPhone(phoneNumber);
    const myName = await nameByPhone(phoneNumber);
    const { lat, lon } = req.query;
    await User.updateOne({ phoneNumber }, { location: { lat, lon } });
    const users = await User.find({ verified: true });

    const promisesCollections = users.map(async (user) => collectionByPhone(user.phoneNumber));
    const allCollections = await Promise.all(promisesCollections);
    const promisesNames = users.map(async (user) => nameByPhone(user.phoneNumber));
    const allNames = await Promise.all(promisesNames);

    const rawSwaps = users.map((user, index) => {
      const { lat: anyLat, lon: anyLon } = user.location;
      const anyPhoneNumber = user.phoneNumber;
      const anyCollection = allCollections[index];
      const { usefulToMeIndexes, usefulToAnyIndexes, amountSwaps } = compareCollections(myCollection, anyCollection);
      const usefulToMe = usefulToMeIndexes.map(usefulToMeIndex => usefulToMeIndex + 1);
      const usefulToAny = usefulToAnyIndexes.map(usefulToAnyIndex => usefulToAnyIndex + 1);
      const distance = distanceAB(lat, lon, anyLat, anyLon)
      const anyName = allNames[index];
      const message = `¡Hola ${anyName}!
Soy ${myName} y podemos intercambiar con *Cromona*.

Tengo estas laminas para ti
${usefulToAny.join(', ')}

Tu tienes estas laminas que me sirven
${usefulToMe.join(', ')}`
      const whatsappLink = generateWhatsappLink(anyPhoneNumber, message);

      return { anyName, distance, amountSwaps, usefulToMe, usefulToAny, whatsappLink }
    }).filter((detail) => (detail.distance < parseInt(RATIO_DISTANCE) && detail.amountSwaps >= 1));

    if (rawSwaps.length === 0) res.json({ swaps: [] })

    const promisesLinks = rawSwaps.map(async (swap) => shortUrl(swap.whatsappLink));
    const allLinks = await Promise.all(promisesLinks);

    const swaps = rawSwaps.map((rawSwap, index) => {
      const { anyName, distance, amountSwaps, usefulToMe, usefulToAny } = rawSwap
      return { anyName, distance, amountSwaps, usefulToMe, usefulToAny, link: allLinks[index] }
    });

    swaps.sort(sortByAmountSwaps);
    res.json({ swaps: swaps });
  } catch (e) {
    error(e);
    res.json(e);
  }
});

app.listen(PORT, () => log(`Listen on http://localhost:${PORT}`));
