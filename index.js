const express = require('express');
const jwt = require('jsonwebtoken');
const fetch = require("node-fetch");
const { isMobilePhone } = require('validator');

const { generateWhatsappLink } = require('./utils/generateWhatsappLink');
const { shortUrl } = require('./utils/shortUrl');
const { sendSMS } = require('./utils/sendSMS');
const { compareCollections } = require('./utils/compareCollections');
const { distanceAB } = require('./utils/distanceAB');
const {
  isRegistered,
  collectionByPhone,
  rawLocations,
  nameByPhone,
  names
} = require('./utils/spreadsheet');

const { connect } = require('./db/connect');
const { User } = require('./db/schemas/User');
const { searchLocation } = require('./utils/searchLocation');

const { log, error } = console;

const { PORT, JWT_SECRET, RATIO_DISTANCE, TOMTOM_APIKEY } = process.env;

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

app.get('/login/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    if (!(isMobilePhone(phoneNumber, ['es-CO']))) throw 'Ingresa un número de Whatsapp válido'
    if (!(await isRegistered(phoneNumber))) throw 'Aún no estás registrado, registrate aquí y termina de llenar tu álbum con Cromona'
    const code = Math.round(Math.random() * 9999).toString().padStart(4, "0");
    await User.updateOne({ phoneNumber }, { phoneNumber, codeInfo: { code, generatedAt: Date.now() } }, { upsert: true });
    const longUrl = generateWhatsappLink(phoneNumber, `${code} es tú código para Cromona.co`, '57');
    const shortedUrl = await shortUrl(longUrl);
    const finish = await sendSMS(`REGISTER: ${shortedUrl}`, '3136109241');
    res.json({state: 'OK'});
  } catch (e) {
    error({state: e});
    res.status(400).json(e);
  }
});

app.post('/verifycode', async (req, res) => {
  try {
    const { phoneNumber, code, lat, lon } = req.body;
    if (!(isMobilePhone(phoneNumber, ['es-CO']))) throw 'Ingrese un número de whatsapp válido'
    if (code.length !== 4) throw 'El código debe ser de 4 dígitos'
    const user = await User.findOne({ phoneNumber });
    if (!user) throw 'Inicie sesión primero'
    if ((!lat && !lon) && !user.location) throw 'Por favor de permisos de ubicación, usaremos su ubicación para encontrar los intercambios más cercanos'
    const codedb = user.codeInfo.code;
    if (code !== codedb) throw 'Código incorrecto'
    const loginMoment = user.codeInfo.generatedAt;
    if ((Date.now() - loginMoment) > 600000) throw 'Muy tarde, solicite nuevamente el código'
    const payload = { phoneNumber };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: 1440
    });
    await User.updateOne({ phoneNumber }, { location: { lat, lon }, verified: true, codeInfo: undefined });
    res.json({ token });
  } catch (e) {
    error(e);
    res.status(400).json(e);
  }
});

app.get('/getswaps', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { phoneNumber, lat, lon } = req.query;
    if (!token) throw 'Token not found'
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) throw 'Invalid token'
      if (decoded.phoneNumber !== phoneNumber) throw 'Do not change the phonenumber'
    });
    const myCollection = await collectionByPhone(phoneNumber);
    const myName = await nameByPhone(phoneNumber);
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
      const usefulToMeTxt = usefulToMe.join(', ');
      const usefulToAnyTxt = usefulToAny.join(', ');
      const distance = distanceAB(lat, lon, anyLat, anyLon)
      const anyName = allNames[index];
      const message = `¡Hola ${anyName}!
Soy ${myName} y podemos intercambiar con *Cromona*.

Tengo estas láminas para tí
${usefulToAny.join(', ')}

Tú tienes estas láminas que me sirven
${usefulToMe.join(', ')}`
      const whatsappLink = generateWhatsappLink(anyPhoneNumber, message);

      return { anyName, distance, amountSwaps, usefulToMe, usefulToMeTxt, usefulToAny, usefulToAnyTxt, whatsappLink }
    }).filter((detail) => (detail.distance < parseInt(RATIO_DISTANCE) && detail.amountSwaps >= 1));

    if (rawSwaps.length === 0){
      res.json({ swaps: [] })
      return
    }

    const promisesLinks = rawSwaps.map(async (swap) => shortUrl(swap.whatsappLink));
    const allLinks = await Promise.all(promisesLinks);

    const swaps = rawSwaps.map((rawSwap, index) => {
      const { anyName, distance, amountSwaps, usefulToMe, usefulToMeTxt, usefulToAny, usefulToAnyTxt } = rawSwap
      return { anyName, distance, amountSwaps, usefulToMe, usefulToMeTxt, usefulToAny, usefulToAnyTxt, link: allLinks[index] }
    });

    swaps.sort(sortByAmountSwaps);
    res.json({ swaps: swaps });
  } catch (e) {
    error(e);
    res.json(e);
  }
});

app.get('/initusers', async (req, res) => {
  try {
    const rawLocationsFromSheet = await rawLocations();
    const locationsPromises = rawLocationsFromSheet.map(async (rawLocation) => {
      const start = Date.now();
      while (Date.now() < start + 210) { }
      const result = await searchLocation(rawLocation);
      return result;
    });
    const locations = await Promise.all(locationsPromises);
    res.json({ locations })
  } catch (e) {
    
  }
});
app.listen(PORT, () => log(`Listen on http://localhost:${PORT}`));
