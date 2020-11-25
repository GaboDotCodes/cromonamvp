const { GoogleSpreadsheet } = require('google-spreadsheet');

const { capName } = require('./capName');

const { SHEET_ID } = process.env;

const credentials = {
  type: 'service_account',
  project_id: 'cromona-mvp',
  private_key_id: '9630dec11b75b0ccab300f9718bdff9e6a807d7e',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCipSgoK9uZ0gAW\ntSEe6Z1QKpNkw+14GR9KhR+JyRkVFtcyXyjM3BBUiI89wzE7l5zKcXgIkETtSkEZ\n7rR1lS1ItL5ZVHqx7tCfC0vzkvK5dWf8mL+syZDMg9WAmeK7dwlFLLjKSFmFJulP\np65335HPJO7K64rF6KWEPasl+Az385C8w2a74l7c4VCaRKXsAh5VTExRYdwCXYTE\nThA9cUB8IWTHgcxMe1Ym/7++jnD/E6AAxZ1wniAlSG6LNSJKN5GwawTHi3GOVcCP\nVc3PAFb1XE6o4po1h/ETyVVg6YbszW2l5PGBvAeDz2ahPP7MWnYCzP6NlawM8iY+\n44Wp7qBXAgMBAAECggEANjWs/kKr9YdwfyEM8oQz6jnemanSFwLskoZvXhnYUdak\nkEX2T92TVdGUSKYr3Sxp1nHea6BGUP68VxvgKwa3KrIPda+6G185SqFVxc/3NchD\nigYRcNJYAEp6mVvxHcGNpfBDgSx/JemzvthpRswOCchKDPlX7iHeNQbm6gdUrzmG\n5p44Dy4mhcjGWKOAJxm4zwzIQp8g+MITqlur8LWCPOGsKJ0QfZJuHsf9bnURtyTC\ngxqFeSP7KsMJZmY+D0opj5UpKf9u6ADMfbCYhcaRNdVBYafbJIDiNkPMj8fZKOF+\nLDtsgB9QgPcKsx7wASG4yDsf99g2r5qJN9FYsqLRkQKBgQDkN03ZDBSwVdK7Vzdo\ndd8KLaox4br2qoPqyhU+/iJWK1wM9QijeUvrmgKlDmVdJFQpmN3wDRgv18QFNuGa\nD8VMNey89YHqIFeE9YmnMu4IljP3gszyY/SN7ctach5jk0jDMm7X0NnpITfQtnjp\nd7JrdwgPl/2pFUuO7ZuR9rW+JwKBgQC2cjzH71tq9s0XdpvOpnP+KlhjbAImhhbz\nBlSQ8sjsmKYoCBakZW5L0zHILovKdQhaATRezlle7Co1Z+cGhRA1Uek+YNvOPDSM\nSRCn8bxgkVkFjRkn/8BM95HzIeMBiprDQ9HJdoVrg+kqLPaYCkHDm2MMQlCdV4P8\nG+KceeaaUQKBgBMVLMVBZVl5U62mlVN+x6+qMdkJ7wBBMdaoHy6tQWHDLmdG9fn1\nYovIzP/QPFmVeBQiXCx+a89UU2e8NxES0ISW3bzPKpXRLoBHp8L7VzwQkzfXEBwU\nj5Zuk9p0QGZDIopv5STWqeH8jRY+q82Z3KlvwpTLOMKyrSa+Z4vE/V1xAoGAX7km\nPLxP2Zot1v6rFsxslVEAWQGlSzMVPWL34akQVFpu6xf7UTvKl8vyFZaeT5YB0L9L\nC+b2KwB70NN3+gq8i00ztD+7c8RQyb3YGFWTwZLhAzGZnkvoSDmogMkpwnhHZOXj\nXvFpZRSrtC4tH25aPNf9KsRsaXEuVYsH5ZNrs1ECgYBRV9viNtQbGiSx8xmlwYwZ\nDmL8wYLgN8s9URzvYv5nfG/XaASK2qrH57ch+BbKTjvHu0CKBoq53uszxX4aIes5\nF1Ex5DYUaJCf+Tx/blIvGuZxKoX5nNFlxjyyv0x4ES8PvzuUoIBqDG1doU1NzQep\naYj9YTCWQzd7XB3X1rngDQ==\n-----END PRIVATE KEY-----\n',
  client_email: 'cromona-mvp@cromona-mvp.iam.gserviceaccount.com',
  client_id: '112712058256833614076',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/cromona-mvp%40cromona-mvp.iam.gserviceaccount.com',
};

const spreadsheetData = async () => {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const table = await sheet.getRows();
    return table;
  } catch (e) {
    console.log(e);
  }
};

const phoneNumbers = async () => {
  const table = await spreadsheetData();
  return table.map((row) => row['Número de whatsapp']);
};

const rawNames = async () => {
  const table = await spreadsheetData();
  return table.map((row) => row['Nombre']);
};

const names = async () => {
  const rawNamesFromTable = await rawNames();
  const namesToReturn = rawNamesFromTable.map((name) => capName(name) );
  return namesToReturn;
};

const stickersTitles = async () => {
  const table = await spreadsheetData();
  const firstSticker = 'Colombia Un país mega diverso [1 Cerros de Mavecure]';
  const indexFirstSticker = Object.keys(table[0]).indexOf(firstSticker);
  const lastSticker = 'Aventura arqueológica [250 Urna funeraria]';
  const indexLastSticker = Object.keys(table[0]).indexOf(lastSticker);
  const titles = Object.keys(table[0]).slice(indexFirstSticker, indexLastSticker + 1);
  return titles;
};

const collectionByPhone = async (phoneNumber) => {
  const table = await spreadsheetData();
  const phones = await phoneNumbers();
  const stickers = await stickersTitles();
  const userIndex = phones.indexOf(phoneNumber);
  const userRow = table[userIndex];
  const collection = stickers.map((sticker) => userRow[sticker]);
  return collection;
};

const rawNameByPhone = async (phoneNumber) => {
  const names = await rawNames();
  const phones = await phoneNumbers();
  const userIndex = phones.indexOf(phoneNumber);
  const rawName = names[userIndex];
  return rawName;
};

const nameByPhone = async (phoneNumber) => {
  const rawName = await rawNameByPhone(phoneNumber);
  return capName(rawName);
};

const isRegistered = async (phoneNumber) => {
  const phones = await phoneNumbers();
  return phones.includes(phoneNumber);
};

module.exports = {
  phoneNumbers,
  nameByPhone,
  names,
  collectionByPhone,
  isRegistered,
};
